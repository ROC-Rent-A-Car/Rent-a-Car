/// <reference path="../index.d.ts" />

type DynamicClass<T, A> = import("std-node").DynamicClass<T, A>;

interface TableEntry {
    key: string,
    value: JSONPrimitive | Date,
    editable?: boolean
}

interface TabObject<U extends TableBase, T extends DynamicClass<RenderObject<U>, boolean>> {
    name: string,
    setupClass: T,
    permission?: keyof APIObject,
    editPermission?: keyof APIObject,
    createPermission?: keyof APIObject
}

interface Structure {
    key: string,
    type: "string" | "number" | "boolean" | "date" | "perm" | "image",
    editable?: boolean
}

interface RenderObject<T extends TableBase> {
    _message: T[];
    _images: string[];
    _structure: DynamicObject<Structure>;
    _editable: boolean;
    _creatable: boolean;
    _user: User;
    _authorization: string;

    build(): Promise<void>;
    _gather(): Promise<TableBase[]>;
    _edit(event: Event, index: number, property: string): void;
    _create(event: Event, index: number): Promise<TableBase>;
    _delete(event: Event, index: number): Promise<void>;
}