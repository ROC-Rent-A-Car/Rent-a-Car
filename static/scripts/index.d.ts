type JSONPrimitive = import("std-node").JSONPrimitive;
type DynamicObject<T> = import("std-node").DynamicObject<T>;
type Car = import("../../src/interfaces/responses/CarResponse").CarResponse;
type RentItem = import("../../src/interfaces/responses/RentItemResponse").RentItemResponse;
type Rent = import("../../src/interfaces/responses/RentResponse").RentResponse;
type TokenInfo = import("../../src/interfaces/responses/TokenInfoResponse").TokenInfoResponse;
type User = import("../../src/interfaces/responses/UserResponse").UserResponse;

interface APIResponse<T> {
    status: number,
    message: string | T
}

declare function constructQuery(object: DynamicObject<string>): string;