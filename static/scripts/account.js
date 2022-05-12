// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var resetEvent;
var user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
var form = document.getElementById("form");

if (user) {
    const inputs = form.getElementsByTagName("input");

    [...inputs].filter((input) => input.type != "password").forEach((input) => input.value = user[input.name]);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (resetEvent) {
            document.getElementById("message").innerText = "";
            clearTimeout(resetEvent);
        }

        /**
         * @type {DynamicObject<string>}
         */
        // @ts-ignore
        const { username, password, verPassword, email, phone, postalCode } = Object.entries([...new FormData(event.target)]);

        if (password == verPassword) {
            const newUserObject = {
                username,
                password,
                email,
                phone,
                postalCode
            };

            APIRequest.request("/user", "PATCH", {
                authorization: constructAuthorization(JSON.parse(user))
            }, user).then(async (response) => {
                /**
                 * @type {APIResponse<User>}
                 */
                const { status, message } = await response.json();

                if (status == 202 && typeof message != "string") {
                    const newUser = JSON.stringify(Object.assign(user, newUserObject));

                    sessionStorage.setItem("user", newUser);

                    if (!sessionStorage.getItem("disable-cache")) {
                        Cookie.set("user", newUser, user.tokenExpiration);
                    }
                } else {
                    const messageNode = document.getElementById("message");

                    messageNode.innerText = JSON.stringify(message);
                    resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);

                    throw message;
                }
            }).catch(console.error);
        }
    });
} else {
    form.remove();
}