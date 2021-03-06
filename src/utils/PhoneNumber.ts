import { Type } from "../templates/Type";

export class PhoneNumber extends Type {

    constructor(phoneNumber: string | undefined) {
        super(phoneNumber ?? "");
    }

    public transform(): string {
        return this.value.replace(/\s{1}/g, "-");
    }

    /**
     * @returns Checks if the phone number fits the global standard
     */
    public validate(): boolean {
        return this.value != undefined && /^\+31[-\s]?6[-\s]?\d{4}[-\s]?\d{4}$/.test(this.transform()!);
    }
}