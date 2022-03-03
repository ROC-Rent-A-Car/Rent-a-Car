// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />

const token = Cookie.get("token");
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
} else if (token) {
    fetch(new Request("/api/v1/authorize", {
        method: "POST",
        body: JSON.stringify({
            token
        })
    })).then(async (response) => {
        if (response.status == 200) {
            replaceLogin();
            sessionStorage.setItem("account", "true");
        } else if (response.status == 401) {
            Cookie.delete("token");
            sessionStorage.setItem("account", "false");
        }
    }).catch((error) => {
        console.error(error);
        sessionStorage.setItem("account", "false");
    });
} else {
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