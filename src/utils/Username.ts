import { Type } from "../templates/Type";

export class Username extends Type {

    constructor(username: string | undefined) {
        super(username);
    }

    public validate(): boolean {
        return this.value != undefined && this.value.length >= 4 && this.value.length <= 64;
    }
}