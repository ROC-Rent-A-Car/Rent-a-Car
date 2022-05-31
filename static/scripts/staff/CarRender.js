// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Render.js" />
/// <reference path="../APIRequest.js" />

/**
 * @implements {Render}
 */
 class CarRender extends Render {

    /**
     * @throws {Error}
     * @param {boolean} editable 
     * @param {boolean} creatable 
     */
    constructor(editable, creatable) {
        super(editable, creatable, {
            nummerbord: {
                key: "license",
                type: "string",
                editable: true
            },
            merk: {
                key: "brand",
                type: "string"
            },
            model: {
                key: "model",
                type: "string"
            },
            prijs: {
                key: "price",
                type: "number",
                editable: true
            },
            foto: {
                key: "image",
                type: "image",
                editable: true
            },
            beschrijving: {
                key: "description",
                type: "string",
                editable: true
            }
        });
    }

    /**
     * @returns {Promise<Car[]>}
     */
    _gather() {
        return new Promise((resolve, reject) => {
            APIRequest.request("/cars/all", "GET",  {
                authorization: this._authorization
            }).then(async (cars) => {
                /**
                 * @type {APIResponse<Car[]>}
                 */
                const { status, message } = await cars.json();

                if (status == 200 && typeof message != "string") {
                    resolve(message);
                } else {
                    throw message;
                }
            }).catch(reject);
        });
    }

    /**
     * @param {Event} event 
     * @param {number} index 
     * @param {string} property 
     * @returns {void}
     */
    _edit(event, index, property) {
        APIRequest.request(`/car/${this._message[index].uuid}`, "PATCH", {
            authorization: this._authorization
        }, {
            // @ts-ignore
            [property]: event.target.value
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
        });
    }

    /**
     * @abstract
     * @param {Event} _ 
     * @param {number} index 
     * @returns {Promise<Car>}
     */
    _create(_, index) {
        return new Promise((resolve, reject) => {
            const entries = [
                ...document.getElementById(index.toString()).children
            // @ts-ignore
            ].slice(0, -1).map((child) => [ child.classList[0], child.firstChild.value ]);

            if (entries.every(([ _, value ]) => Boolean(value))) {
                APIRequest.request("/car", "PUT", {
                    authorization: this._authorization
                }, Object.fromEntries(entries)).then(async (response) => {
                    const { status, message } = await response.json();

                    if (status == 201 && typeof message != "string") {
                        resolve(message);
                    } else {
                        throw message;
                    }
                }).catch(reject);
            }
        });
    }

    /**
     * @abstract
     * @param {Event} _ 
     * @param {number} index 
     * @returns {Promise<void>}
     */
    _delete(_, index) {
        return new Promise((resolve, reject) => {
            APIRequest.request(`/car/${this._message[index].uuid}`, "DELETE", {
                authorization: this._authorization
            }).then((response) => {
                if (response.status == 204) {
                    resolve();
                } else {
                    throw "Not delete"; // Fetch won't give a message on a DELETE method
                }
            }).catch(reject);
        });
    }
}