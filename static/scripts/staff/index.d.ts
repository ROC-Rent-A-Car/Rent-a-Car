type DynamicClass<T, A> = import("std-node").DynamicClass<T, A>;

interface TableEntry {
    key: string,
    value: JSONPrimitive | Date,
    editable?: boolean
}

interface TabObject<T extends DynamicClass<RenderObject, boolean>> {
    name: string,
    setupClass: T,
    permission?: keyof APIObject,
    editPermission?: keyof APIObject
}

interface RenderObject {
    _message?: string;
    _editable: boolean;
    _user?: User;
    _authorization: string;

    build(): void;
    _render(): Promise<DynamicObject<TableEntry>[]>;
    _edit(event: Event, index: number, property: string): void;
}