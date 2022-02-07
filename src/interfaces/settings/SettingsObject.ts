import { APIObject } from "./APIObject";
import { DatabaseObject } from "./DatabaseObject";
import { WebObject } from "./WebObject"

export interface SettingsObject {
    web: WebObject,
    database: DatabaseObject,
    api: APIObject
}