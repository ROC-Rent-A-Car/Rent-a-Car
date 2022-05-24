// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault();

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
            const isStringMessage = typeof message == "string";

            if (status == 201 && !isStringMessage) {
                const user = JSON.stringify(message);

                sessionStorage.setItem("user", user);
                Cookie.set("user", user, message.tokenExpiration);
                window.location.href = "/account.html";
            } else {
                show(isStringMessage ? message : "Onbekende fout.", "red");

                throw message;
            }
        }).catch(console.error);
    } else {
        show("Wachtwoorden komen niet overeen.", "red");
    }
});