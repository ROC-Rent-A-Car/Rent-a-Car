/**
 * A lookup table to minimize the usage of large strings when providing error messages
 */
export enum Conflict {
    INVALID_FIELDS = "Een aantal velden zijn ongeldig",
    INVALID_AUTHORIZATION = "De authorisatie is ongeldig",
    INVALID_LOGIN = "Ongeldige login",
    TOKEN_ERROR = "Er is een fout opgetreden bij het genereren van de token",
    IN_USE_ERROR = "Deze gebruikersnaam of email is al in gebruik"
}