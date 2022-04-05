// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />


var userObject = JSON.parse(Cookie.get("user"));

/**
 * @returns {void}
 */
function renderSetups() {
    if (sessionStorage.getItem("account") == "true" && userObject) {
        APIRequest.request("/items/setup", "GET",  {
            authorization: constructAuthorization(userObject)
        }).then(async (items) => {
            /**
             * @type {APIResponse<RentItem[]>}
             */
            const { status, message } = await items.json();

            if (status == 200 && typeof message != "string") {
                constructTable(message.map((item) => ({
                    klaargezet: {
                        key: "setup",
                        value: item.setup,
                        editable: true
                    },
                    nummerbord: {
                        key: "car",
                        value: item.car.license
                    },
                    merk: {
                        key: "car",
                        value: item.car.brand
                    },
                    model: {
                        key: "car",
                        value: item.car.model
                    },
                    tijd: {
                        key: "rentFromt",
                        value: new Date(item.rentFrom)
                    }
                })), (event, index) => {
                    APIRequest.request(`/setup/${message[index].uuid}`, "PATCH", {
                        authorization: constructAuthorization(userObject)
                    }, {
                        // @ts-ignore
                        status: event.target.value == "on" ? true : false
                    }).then(async (result) => {
                        /**
                         * @type {APIResponse<undefined>}
                         */
                        const { status, message } = await result.json();

                        if (status != 202 || message) {
                            event.preventDefault();

                            throw message || "Unknown status";
                        } 
                    }).catch((error) => {
                        if (!event.defaultPrevented) {
                            event.preventDefault();
                        }

                        console.error(error);
                    })
                });
            } else {
                throw message;
            }
        }).catch(console.error);
    }
}

/**
 * @returns {void}
 */
function renderCars() {
    if (sessionStorage.getItem("account") == "true" && userObject) {
        APIRequest.request("/cars/top", "GET",  {
            authorization: constructAuthorization(userObject)
        }).then(async (cars) => {
            /**
             * @type {APIResponse<Car[]>}
             */
            const { status, message } = await cars.json();

            if (status == 200 && typeof message != "string") {
                constructTable(message.map((car) => ({
                    nummerbord: {
                        key: "license",
                        value: car.license,
                        editable: true
                    },
                    merk: {
                        key: "brand",
                        value: car.brand
                    },
                    model: {
                        key: "model",
                        value: car.model
                    },
                    prijs: {
                        key: "price",
                        value: car.price,
                        editable: true
                    },
                    foto: {
                        key: "image",
                        value: car.image,
                        editable: true
                    },
                    beschrijving: {
                        key: "description",
                        value: car.description,
                        editable: true
                    }
                })), (event, index, property) => {
                    APIRequest.request(`/car/${message[index].uuid}`, "PATCH", {
                        authorization: constructAuthorization(userObject)
                    }, {
                        // @ts-ignore
                        [property]: event.target.value
                    });
                });

                document
            } else {
                throw message;
            }
        }).catch(console.error);
    }
}

/**
 * @returns {void}
 */
function renderUsers() {
    APIRequest.request("/users", "GET",  {
        authorization: constructAuthorization(userObject)
    }).then(async (users) => {
        /**
         * @type {APIResponse<User[]>}
         */
        const { status, message } = await users.json();

        if (status == 200 && typeof message != "string") {
            constructTable(message.map((user) => ({
                gebruikersnaam: {
                    key: "username",
                    value: user.username
                },
                email: {
                    key: "email",
                    value: user.email
                },
                nummer: {
                    key: "phone",
                    value: user.phone
                },
                postcode: {
                    key: "postalCode",
                    value: user.postalCode
                },
                huren: {
                    key: "renting",
                    value: user.renting,
                    editable: true
                },
                "toegang niveau": {
                    key: "permLevel",
                    value: user.permLevel,
                    editable: true
                }
            })));
        } else {
            throw message;
        }
    }).catch(console.error);
}

/**
 * @param {DynamicObject<{key:string,value:JSONPrimitive|Date,editable?:boolean}>[]} data 
 * @param {(event: Event, index: number, property: string) => void|undefined} editMethod
 * @returns {void}
 */
function constructTable(data, editMethod = undefined) {
    document.getElementById("content").append(
        document.createElement("tr").innerHTML = "<th>" + Object.keys(data[0]).join("</th><th>") + "</th>",
        ...data.map((element, index) => {
            const row = document.createElement("tr");

            row.classList.add(index.toString());
            row.append(...Object.entries(element).map(([ baseKey, { key, value, editable } ]) => {
                const entry = document.createElement("td");

                entry.classList.add(baseKey);
                
                if (typeof value == "boolean") {
                    entry.innerHTML = `<input type="checkbox" ${value ? "checked" : ""} ${editable ? "" : "readonly"}>`;
                } else if (value instanceof Date) {
                    entry.innerHTML = `<input type="datetime-local" value="${
                        value.toISOString().split(".")[0]
                    }" ${editable ? "" : "readonly"}>`;
                } else {
                    entry.innerHTML = `<input type="${
                        typeof value == "number" ? "number" : "text"
                    }" value="${value}" ${editable ? "" : "readonly"}>`
                }

                entry.addEventListener("change", (event) => editMethod(event, index, key));

                return entry;
            }));

            return row;
        })
    );
}