import { Type } from "../templates/Type";

export class Email extends Type {

    constructor(email: string | undefined) {
        super(email ?? "");
    }

    /**
     * @returns The provided email in lowercase 
     */
    public transform(): string {
        return (this.value ?? "").toLowerCase();
    }

    /**
     * @returns Checks if the email fits the Chromium standard
     */
    public validate(): boolean {
        // Taken from the Chromium standard
        return this.value != undefined && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.transform());
    }
}