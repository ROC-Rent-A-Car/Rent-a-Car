type JSONPrimitive = import("std-node").JSONPrimitive;
type DynamicObject<T> = import("std-node").DynamicObject<T>;
type APIObject = import("../../src/interfaces/settings/APIObject").APIObject;
type TableBase = import("../../src/interfaces/tables/TableBase").TableBase;
type Car = import("../../src/interfaces/responses/CarResponse").CarResponse;
type RentItem = import("../../src/interfaces/responses/RentItemResponse").RentItemResponse;
type Rent = import("../../src/interfaces/responses/RentResponse").RentResponse;
type TokenInfo = import("../../src/interfaces/responses/TokenInfoResponse").TokenInfoResponse;
type User = import("../../src/interfaces/responses/UserResponse").UserResponse;
type DateRange = import("../../src/interfaces/responses/DateRangeResponse").DateRangeResponse;

interface APIResponse<T> {
    status: number,
    message: string | T
}

declare function constructQuery(object: DynamicObject<JSONPrimitive>): string;
declare function constructAuthorization(object?: User): string;
declare function show(message: string, color: string): void;