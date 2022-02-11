import { TableBase } from "./TableBase";
import { User } from "./User";

export interface Rent extends TableBase {
    user: string,
    userObject: User,
    pending: boolean,
    pending_since: Date | string
}