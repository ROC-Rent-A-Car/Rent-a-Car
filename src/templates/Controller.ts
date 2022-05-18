import { next } from "../types/next";
import { request } from "../types/request";
import { response } from "../types/response";
import { RequestMethod } from "../enums/RequestMethod";
import { DevConsole, Status } from "std-node";
import { APP, SETTINGS } from "..";
import { Authorize } from "../utils/Authorize";

/**
 * A template which handles the API controller registration
 */
export abstract class Controller extends Authorize {

    constructor(path: string, method: RequestMethod, versionOverride?: number) {
        super();
        
        // Transforms the path string to make sure that API versions are supported
        path = `/api/v${versionOverride || SETTINGS.get("api").version}/${path.startsWith("/") ? path.slice(1) : path}`;

        // Uses request method as a key for the express instance to register the endpoint under the right method
        APP[
            <keyof typeof APP>RequestMethod[method].toLowerCase()
        ](path, (request: request, response: response, next: next) => this.request(request, response, next).catch(DevConsole.error));

        DevConsole.info("Registered \x1b[34m%s\x1b[0m as \x1b[34m%s\x1b[0m", path, RequestMethod[method]);
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
        });
    }
}