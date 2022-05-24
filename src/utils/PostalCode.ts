import { Type } from "../templates/Type";

export class PostalCode extends Type {

    constructor(postalCode: string | undefined) {
        super(postalCode ?? "");
    }

    public transform(): string {
        return this.value.toUpperCase().replace(/\s{1}/g, "-");
    }

    public validate(): boolean {
        return this.value != undefined && /^[1-9]\d{3}[-\s]?[A-Z]{2}$/.test(this.value);
    }
}