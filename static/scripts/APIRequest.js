// @ts-check
/// <reference path="index.d.ts" />

class APIRequest {

    /**
     * @param {string} path 
     * @param {"GET"|"PATCH"|"POST"|"PUT"} method
     * @param {DynamicObject<string>} headers
     * @param {string} body
     * @returns {Promise<Response>}
     */
    static async request(path, method, headers = {}, body = undefined) {
        return fetch(new Request("/api/v1/" + path, {
            method,
            body,
            headers: {
                Accept: "application/json",
                ...headers
            }
        }));
    }
}