// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

// @ts-ignore For some reason js decided that having the same variable in 2 unrelated files is an error
let resetEvent;

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
    const { username, password, verPassword, email, number, postal } = Object.fromEntries([...new FormData(event.target)])


    if (password == verPassword) {
        APIRequest.request("/user", "PUT", {}, constructQuery({
            username,
            password,
            email,
            number,
            postal
        })).then(async (response) => {
            /**
             * @type {APIResponse<User>}
             */
            const { status, message } = await response.json();

            if (status == 201 && typeof message != "string") {
                sessionStorage.setItem("account", "true");
                Cookie.set("user", JSON.stringify(message), message.tokenExpiration);
            } else {
                const messageNode = document.getElementById("message");
                
                messageNode.innerText = JSON.stringify(message);
                resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);

                throw message;
            }
        }).catch(console.error);
    }
});