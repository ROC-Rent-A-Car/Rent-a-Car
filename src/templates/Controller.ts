import multer from "multer";
import { DevConsole, Status } from "std-node";
import { next } from "../types/next";
import { request } from "../types/request";
import { response } from "../types/response";
import { RequestMethod } from "../enums/RequestMethod";
import { APP, SETTINGS } from "..";
import { Authorize } from "../utils/Authorize";
import { PermLevel } from "../enums/PermLevel";
import { QueryParser } from "../utils/QueryParser";
import { Conflict } from "../enums/Conflict";

/**
 * A template which handles the API controller registration
 */
export abstract class Controller extends Authorize {
    
    /**
     * Registers a simple API endpoint
     * @param path The url path
     * @param method The request method
     * @param versionOverride The API version if it's different from the one set in the settings
     */
    constructor(path: string, method: RequestMethod, versionOverride?: number);
    /**
     * Registers a file stream endpoint
     * @param path The url path
     * @param destination The file upload destination
     * @param level What permission level is required to access the endpoint
     * @param filter What type of files are allowed to be uploaded
     * @param versionOverride The API version if it's different from the one set in the settings
     */
    constructor(path: string, destination: string, level: PermLevel, filter?: string, versionOverride?: number);
    constructor(
        path: string, 
        destinationOrMethod: string | RequestMethod, 
        levelOrVersionOverride?: number,
        filter?: string,
        versionOverride?: number
    ) {
        // Defaulting to the put method for file uploads
        let method: keyof typeof APP = "put";

        super();
        
        if (typeof destinationOrMethod == "string" && levelOrVersionOverride) {
            // Transforms the path string to make sure that API versions are supported
            path = `/api/v${
                versionOverride ?? SETTINGS.get("api").version
            }/${path.startsWith("/") ? path.slice(1) : path}`;
            
            APP[method](path, (request: request, response: response, next: next) => {
                // Bad bypass around the horrible error handling of multer but it works
                let error = "";
                let status = Status.OK;

                multer({
                    dest: destinationOrMethod,
                    fileFilter: async (request, file, callback) => {
                        // Parse the authorization header query
                        const { userId, token } = new QueryParser(request.headers.authorization || "");

                        // Checking if the user is authorized to access the endpoint
                        if (userId && token && await this.isAuthorized(request.ip, userId, token, levelOrVersionOverride)) {
                            // Filter specific file types
                            if (filter && file.mimetype.includes(filter)) {
                                callback(null, true);
                            } else {
                                error = Conflict.INVALID_FIELDS;
                                status = Status.BAD_REQUEST;

                                callback(null, false);
                            }
                        } else {
                            error = Conflict.INVALID_AUTHORIZATION;
                            status = Status.UNAUTHORIZED;

                            callback(null, false);
                        }
                    }
                }).single("file")(request, response, () => {
                    if (error) {
                        this.respond(response, status, error);
                    } else {
                        this.request(request, response, next).catch(DevConsole.error);
                    }
                });
            });
        } else if (typeof destinationOrMethod == "number") {
            // Transforms the path string to make sure that API versions are supported
            path = `/api/v${
                levelOrVersionOverride ?? SETTINGS.get("api").version
            }/${path.startsWith("/") ? path.slice(1) : path}`;

            // Setting the method type
            method = <keyof typeof APP>RequestMethod[destinationOrMethod].toLowerCase();

            // Uses request method as a key for the express instance to register the endpoint under the right method
            APP[method](path, (
                request: request, 
                response: response, 
                next: next
            ) => this.request(request, response, next).catch(DevConsole.error));
        }
        
        // Logging the registration of the controller
        DevConsole.info("Registered \x1b[34m%s\x1b[0m as \x1b[34m%s\x1b[0m", path, method.toUpperCase());
    }

    /**
     * An abstract method which will be called when the provided path is called
     * @param request The request object provided by express
     * @param response The response object provided by express
     * @param next The next callback provided by express
     */
    protected abstract request(request: request, response: response, next: next): Promise<void>;

    /**
     * A method which constructs a standard response object
     * @param response The response object provided by express
     * @param status The response status code
     * @param message The response message/object
     */
    protected respond<T>(response: response, status: Status, message?: T): void {
        response.status(status).json({
            status,
            message
        }).end();
    }
}