// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault();

    /**
     * @type {DynamicObject<string>}
     */
    // @ts-ignore TS really had a stroke here
    const { username, password, remember } = Object.fromEntries([...new FormData(event.target)])

    APIRequest.request("login", "POST", {}, constructQuery({
        username,
        password
    })).then(async (response) => {
        /**
         * @type {APIResponse<User>}
         */
        const { status, message } = await response.json();

        if (status == 200 && typeof message != "string") {
            sessionStorage.setItem("account", "true");

            if (remember == "on") {
                Cookie.set("user", JSON.stringify(message), message.tokenExpiration);
            }
        } else {
            throw message;
        }
    }).catch(console.error);
});