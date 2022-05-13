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
     */
    constructor(editable) {
        super(editable);
    }

    /**
     * @returns {Promise<DynamicObject<TableEntry>[]>}
     */
    _render() {
        return new Promise((resolve, reject) => {
            APIRequest.request("/cars/top", "GET",  {
                authorization: this._authorization
            }).then(async (cars) => {
                /**
                 * @type {APIResponse<Car[]>}
                 */
                const { status, message } = await cars.json();

                if (status == 200 && typeof message != "string") {
                    this._message = message;

                    resolve(message.map((car) => ({
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
                    })));
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
}