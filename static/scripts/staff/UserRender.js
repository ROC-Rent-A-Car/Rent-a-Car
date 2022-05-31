// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Render.js" />
/// <reference path="../APIRequest.js" />

/**
 * @implements {Render}
 */
class UserRender extends Render {

    /**
     * @throws {Error}
     * @param {boolean} editable 
     * @param {boolean} creatable
     */
    constructor(editable, creatable) {
        super(editable, creatable, {
            gebruikersnaam: {
                key: "username",
                type: "string"
            },
            email: {
                key: "email",
                type: "string"
            },
            nummer: {
                key: "phone",
                type: "string"
            },
            postcode: {
                key: "postalCode",
                type: "string"
            },
            "toegang niveau": {
                key: "permLevel",
                type: "perm",
                editable: true
            }
        });
    }

    /**
     * @returns {Promise<User[]>}
     */
    _gather() {
        return new Promise((resolve, reject) => {
            APIRequest.request("/users", "GET",  {
                authorization: this._authorization
            }).then(async (users) => {
                /**
                 * @type {APIResponse<User[]>}
                 */
                const { status, message } = await users.json();

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
     * @returns {void}
     */
    _edit(event, index) {
        APIRequest.request(`/user/${this._message[index].uuid}`, "PATCH", {
            authorization: this._authorization
        }, {
            // @ts-ignore
            permLevel: event.target.value
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