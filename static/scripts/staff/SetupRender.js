// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Render.js" />
/// <reference path="../APIRequest.js" />

/**
 * @implements {Render}
 */
 class SetupRender extends Render {

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
            APIRequest.request("/items/setup", "GET",  {
                authorization: this._authorization
            }).then(async (items) => {
                /**
                 * @type {APIResponse<RentItem[]>}
                 */
                const { status, message } = await items.json();

                if (status == 200 && typeof message != "string") {
                    this._message = message;

                    resolve(message.map((item) => ({
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
     * @returns {void}
     */
    _edit(event, index) {
        APIRequest.request(`/setup/${this._message[index].uuid}`, "PATCH", {
            authorization: this._authorization
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
        });
    }
}