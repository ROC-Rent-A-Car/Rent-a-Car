import { Type } from "../templates/Type";

export class PostalCode extends Type {

    constructor(postalCode: string) {
        super(postalCode);
    }

    public validate(): boolean {
        return this.value != undefined && /^[1-9]\d{3}[A-Z]{2}$/.test(this.value);
    }
}