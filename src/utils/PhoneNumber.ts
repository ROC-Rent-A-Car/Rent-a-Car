import { Type } from "../templates/Type";

export class PhoneNumber extends Type {

    constructor(phoneNumber: string) {
        super(phoneNumber);
    }

    /**
     * @returns Checks if the phone number fits the global standard
     */
    public validate(): boolean {
        return this.value != undefined && /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(this.transform()!);
    }
}