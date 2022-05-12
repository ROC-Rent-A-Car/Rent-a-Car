import { PermLevel } from "../../enums/PermLevel";

export interface APIObject {
    version: number,
    token_days_valid: number,
    token_refresh_margin: number,
    max_pending: number,
    change_perm_level_permission: PermLevel,
    user_view_permission: PermLevel,
    car_creation_permission: PermLevel,
    car_edit_permission: PermLevel,
    setup_status_toggle_permission: PermLevel,
    rent_status_toggle_permission: PermLevel,
    rent_history_permission: PermLevel,
    rent_administration_permission: PermLevel
}