import { Type } from "../templates/Type";

export class HouseNumber extends Type {

    constructor(value: string) {
        super(value);
    }

    public transform(): string {
        return this.value.toUpperCase().replace(/\s{1}/g, "-");
    }

    public validate(): boolean {
        return /^\d{1,6}[-\s]?[a-z0-9]{0,4}$/i.test(this.value);
    }
}