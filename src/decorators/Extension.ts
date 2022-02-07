import { DynamicClass } from "std-node";
import { extensions } from "../constants/extensions";

export function Extension<T extends DynamicClass<any>>(child: T): T {
    // Gets the parent class name and adds the child onto the stack
    extensions.set(child.prototype.__proto__.constructor.name, [
        ...extensions.get(child.prototype.__proto__.constructor.name) ?? [],
        child
    ]);

    return child;
}