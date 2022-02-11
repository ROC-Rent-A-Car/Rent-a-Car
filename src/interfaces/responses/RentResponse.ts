import { TableBase } from "../tables/TableBase";
import { UserResponse } from "./UserResponse";

export interface RentResponse extends TableBase {
    user: UserResponse,
    pending: boolean,
    pendingSince: number
}