import { Type } from "../templates/Type";

export class Username extends Type {

    constructor(username: string | undefined) {
        super(username);
    }

    public validate(): boolean {
        return this.value != undefined && this.value.length >= 6 && this.value.length <= 64;
    }
}