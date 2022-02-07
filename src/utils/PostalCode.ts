import { Type } from "../templates/Type";

export class PostalCode extends Type {

    constructor(postalCode: string) {
        super(postalCode);
    }

    public validate(): boolean {
        return this.value != undefined && /\d{4}[A-Z]{2}/.test(this.value);
    }
}