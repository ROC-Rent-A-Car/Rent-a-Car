import { Status } from "std-node";
import { Extension } from "../decorators/Extension";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

@Extension
export class PostCars extends Controller {

    constructor() {
        super("/cars/:infoType/:userId", RequestMethod.POST);
    }

    protected request(_: request, response: response): void {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}