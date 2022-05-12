// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var resetEvent;

document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault();

    if (resetEvent) {
        document.getElementById("message").innerText = "";
        clearTimeout(resetEvent);
    }

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

        if (status == 200 && typeof message != "string") {
            const user = JSON.stringify(message);

            sessionStorage.setItem("user", user);

            if (remember == "on") {
                Cookie.set("user", user, message.tokenExpiration);
                sessionStorage.removeItem("disable-cache");
            } else {
                Cookie.delete("user");
                sessionStorage.removeItem("user");
                sessionStorage.setItem("disable-cache", "true");
            }

            window.location.href = "/account.html";
        } else {
            const messageNode = document.getElementById("message");

            messageNode.innerText = JSON.stringify(message);
            resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);

            throw message;
        }
    }).catch(console.error);
});