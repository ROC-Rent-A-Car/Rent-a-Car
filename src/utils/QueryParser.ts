import { BetterObject } from "std-node";

export class QueryParser extends BetterObject<string> {

    constructor(query?: string) {
        if (query) {
            super(Object.fromEntries(query.split("&").map((value) => value.split("="))));
        } else {
            super({});
        }
    }
}