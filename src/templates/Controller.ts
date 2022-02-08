import { next } from "../types/next";
import { request } from "../types/request";
import { response } from "../types/response";
import { RequestMethod } from "../enums/RequestMethod";
import { DevConsole, Status } from "std-node";
import { APP, SETTINGS } from "..";

/**
 * A template which handles the API controller registration
 */
export abstract class Controller {

    constructor(path: string, method: RequestMethod, versionOverride?: number) {
        // Transforms the path string to make sure that API versions are supported
        path = `/api/v${versionOverride || SETTINGS.get("api").version}/${path.startsWith("/") ? path.slice(1) : path}`;

        // Switches between the request methods to properly register an endpoint
        // I wish I could just do all of these inline but references and all that stuff limits me
        switch (method) {
            case RequestMethod.GET:
                APP.get(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.POST:
                APP.post(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.PUT:
                APP.put(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.DELETE:
                APP.delete(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.PATCH:
                APP.patch(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.OPTIONS:
                APP.options(path, (request, response, next) => this.request(request, response, next));
                break;
            case RequestMethod.HEAD:
                APP.head(path, (request, response, next) => this.request(request, response, next));
                break;
            default:
                APP.all(path, (request, response, next) => this.request(request, response, next));
        }

        DevConsole.info("Registered \x1b[34m%s\x1b[0m as \x1b[34m%s\x1b[0m", path, RequestMethod[method]);
    }

    /**
     * An abstract method which will be called when the provided path is called
     * @param request The request object provided by express
     * @param response The response object provided by express
     * @param next The next callback provided by express
     */
    protected abstract request(request: request, response: response, next: next): void;

    /**
     * A method which constructs a standard response object
     * @param response The response object provided by express
     * @param status The response status code
     * @param message The response message/object
     */
    protected respond(response: response, status: Status, message?: any): void {
        response.status(status).json({
            status,
            message
        })
    }
}