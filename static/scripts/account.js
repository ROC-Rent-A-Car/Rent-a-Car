// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var resetEvent;
var user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
var form = document.getElementById("form");

if (user) {
    const inputs = form.getElementsByTagName("input");

    [...inputs].filter(
        (input) => input.type != "password" && input.type != "submit"
    ).forEach((input) => input.value = user[input.name]);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (resetEvent) {
            document.getElementById("message").innerText = "";
            clearTimeout(resetEvent);
        }

        // @ts-ignore
        const form = [...new FormData(event.target)];
        const { username, password, verPassword, email, phone, postalCode } = Object.fromEntries(form);

        if (password) {
            if (form.filter(([ key ]) => key.toLowerCase().includes("password")).some(
                ([ key, value ]) => user[key] != value
            ) || password == verPassword) {
                const newUserObject = {
                    username,
                    password: password == verPassword ? password : undefined,
                    email,
                    phone,
                    postalCode
                };

                APIRequest.request("/user", "PATCH", {
                    authorization: constructAuthorization(user)
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

                        show("Account bijgewerkt", "green");
                    } else {
                        show(JSON.stringify(message), "red");

                        throw message;
                    }
                }).catch(console.error);
            } else {
                show("Bevestig uw wachtwoord", "red");
            }
        } else {
            show("Vul uw wachtwoord in", "red");
        }
    });
} else {
    form.remove();
}

/**
 * @param {string} message 
 * @param {string} color 
 * @returns {void}
 */
function show(message, color) {
    const messageNode = document.getElementById("message");
    
    messageNode.style.color = color;
    messageNode.innerText = JSON.stringify(message);
    resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);
}