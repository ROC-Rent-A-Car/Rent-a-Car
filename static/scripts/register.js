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
    // @ts-ignore
    const { username, password, verPassword, email, phone, postalCode } = Object.fromEntries([...new FormData(event.target)])


    if (password == verPassword) {
        APIRequest.request("/user", "PUT", {}, {
            username,
            password,
            email,
            phone,
            postalCode
        }).then(async (response) => {
            /**
             * @type {APIResponse<User>}
             */
            const { status, message } = await response.json();
            const messageNode = document.getElementById("message");

            if (status == 201 && typeof message != "string") {
                sessionStorage.setItem("account", "true");
                Cookie.set("user", JSON.stringify(message), message.tokenExpiration);
                window.location.href = "/account.html";
            } else {
                messageNode.innerText = JSON.stringify(message);
                resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);

                throw message;
            }
        }).catch(console.error);
    }
});