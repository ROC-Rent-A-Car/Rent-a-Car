// @ts-check
/// <reference path="index.d.ts" />

class Cookie {

    /**
     * @static
     * @param {string} name 
     * @param {JSONPrimitive} value 
     * @param {number} expirationTimestamp
     * @returns {void} 
     */
    static set(name, value, expirationTimestamp) {
        document.cookie = `${name}=${value};expires=${new Date(expirationTimestamp).toUTCString()}path=/`;
    }

    /**
     * @static
     * @param {string} name
     * @returns {string|void}
     */
    static get(name) {
        const cookies = decodeURIComponent(document.cookie).split(/\s*;\s*/);
        const index = cookies.findIndex((cookie) => new RegExp(`${name}\\s*=`).test(cookie));

        if (index != -1) {
            return cookies[index].split("=")[1];
        }
    }

    /**
     * @static
     * @param {string} name
     * @returns {void}
     */
    static delete(name) {
        Cookie.set(name, null, 0);
    }
}