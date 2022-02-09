/**
 * A lookup table to minimize the usage of large strings when providing error messages
 */
export enum Conflict {
    INVALID_FIELDS = "Some fields are invalid",
    INVALID_AUTHORIZATION = "The provided authorization was not valid",
    INVALID_LOGIN = "Invalid login",
    TOKEN_ERROR = "There was a problem generating the token",
    IN_USE_ERROR = "Either the username or email is already in use",
    POPULATION_ERROR = "There was a problem populating the object"
}