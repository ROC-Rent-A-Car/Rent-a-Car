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
    const { username, password, remember } = Object.fromEntries([...new FormData(event.target)]);

    APIRequest.request("/login", "POST", {}, {
        username,
        password
    }).then(async (response) => {
        /**
         * @type {APIResponse<User>}
         */
        const { status, message } = await response.json();
        const isStringMessage = typeof message == "string";

        if (status == 200 && !isStringMessage) {
            const user = JSON.stringify(message);

            sessionStorage.setItem("user", user);

            if (remember == "on") {
                Cookie.set("user", user, message.tokenExpiration);
                sessionStorage.removeItem("disable-cache");
            } else {
                Cookie.delete("user");
                sessionStorage.setItem("disable-cache", "true");
            }

            window.location.href = "/account.html";
        } else {
            show(isStringMessage ? message : "Onbekende fout.", "red");

            throw message;
        }
    }).catch(console.error);
});