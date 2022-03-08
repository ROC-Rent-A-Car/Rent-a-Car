// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

const authorization = Cookie.get("authorization");
const nav = document.createElement("div");
const footer = document.createElement("div");

nav.classList.add("navigation");
nav.innerHTML = [
    "contact",
    "index",
    "huren",
    "inloggen"
].map((page) => `
    <a ${page == "inloggen" ? "id=\"account\"" : ""} href="/${page}.html">
        ${page == "index" ? "Home" : page.charAt(0).toUpperCase() + page.slice(1)}
    </a>
`).join("");

footer.classList.add("footer")
footer.innerHTML = `
    <p>Telefoon: (036) 123 45 67</p>
    <p>Adres: Almere Autopad 12</p>
`;

document.body.insertBefore(nav, document.body.firstChild);
document.body.append(footer);

if (sessionStorage.getItem("account") == "true") {
    replaceLogin();
} else if (authorization) {
    APIRequest.request(
        "/api/v1/authorize", 
        "POST", 
        {}, 
        constructQuery(JSON.parse(authorization))
    ).then(async (response) => {
        /**
         * @type {APIResponse<TokenInfo>}
         */
        const { status, message } = await response.json();

        if (status == 200 && typeof message != "string") {
            replaceLogin();
            Cookie.set("token", message.token, message.tokenExpiration);
            sessionStorage.setItem("account", "true");
        } else {
            logout();
            
            throw message;
        }
    }).catch((error) => {
        console.error(error);
        logout();
    });
} else {
    logout();
}

/**
 * @returns {void}
 */
function logout() {
    Cookie.delete("token");
    sessionStorage.setItem("account", "false");
}

/**
 * @returns {void}
 */
function replaceLogin() {
    /**
     * Using query selector with jsdoc to avoid type errors
     * @type {HTMLLinkElement}
     */
    const account = document.querySelector("a#account");

    account.href = "account.html";
    account.innerHTML = "Account <i class=\"fas fa-user-circle\"></i>";
}

/**
 * @param {DynamicObject<string>} object 
 * @returns {string}
 */
function constructQuery(object) {
    return Object.entries(object).map(([ key, value ]) => `${key}=${value}`).join("&");
}