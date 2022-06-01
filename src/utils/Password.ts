import { createHash } from "crypto";
import { Type } from "../templates/Type";

export class Password extends Type {

    constructor(password: string | undefined) {
        super(password ?? "");
    }

    /**
     * @returns A sha256 and base64 hashed version of the provided password
     */
    public transform(): string {
        return createHash("sha256").update(this.value ?? "").digest("base64");
    }

    /**
     * @returns If the password is in between 8 and 64 characters long, contains a digit and a special character
     */
    public validate(): boolean {
        return this.value != undefined &&
            this.value.length >= 8 &&
            this.value.length <= 64 &&
            /[^a-zA-Z\d].*?\d|\d.*?[^a-zA-Z\d]/.test(this.value);
    }
}