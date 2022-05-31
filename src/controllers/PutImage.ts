import { renameSync } from "fs";
import { join } from "path";
import { Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

export class PutImage extends Controller {
    
    constructor() {
        super(
            "image", 
            join(__dirname, "../../static/resources"),
            SETTINGS.get("api").car_creation_permission,
            "image/"
        );
    }

    protected async request(request: request, response: response): Promise<void> {
        // Checking if a file is present
        if (request.file) {
            // Rename the file to turn it from a blob to a file
            renameSync(
                request.file.path, 
                request.file.path.split("\\").slice(0, -1).join("\\") + `\\${request.file.originalname}`
            );

            this.respond(response, Status.OK);
        } else {
            // The file was not present
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}