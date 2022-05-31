// @ts-check
/// <reference path="index.d.ts" />

class APIRequest {

    /**
     * @param {string} path 
     * @param {"GET"|"PATCH"|"POST"|"PUT"} method
     * @param {DynamicObject<string>} headers
     * @param {DynamicObject<JSONPrimitive|FormDataEntryValue>} body
     * @returns {Promise<Response>}
     */
    static async request(path, method, headers = {}, body = undefined) {
        const stringifiedBody = JSON.stringify(body);
        
        return fetch(new Request("/api/v1" + path, {
            method,
            body: stringifiedBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Content-Length": body ? stringifiedBody.length.toString() : undefined,
                ...headers
            }
        }));
    }

    /**
     * @param {string} path 
     * @param {FormData} body 
     * @param {DynamicObject<string>} headers 
     */
    static async upload(path, body, headers = {}) {
        return fetch(new Request("/api/v1" + path, {
            method: "PUT",
            body,
            headers
        }));
    }
}