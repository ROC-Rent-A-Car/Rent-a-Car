// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
var nav = document.createElement("div");
var account = document.createElement("div");
var footer = document.createElement("div");

nav.id = "nav";
nav.classList.add("navigation");
nav.innerHTML = [
    "contact",
    "index",
    "huren"
].map((page, index) => `
    <a tabindex="${index + 1}" href="/${page}.html">
        ${page == "index" ? "Home" : page.charAt(0).toUpperCase() + page.slice(1)}
    </a>
`).join("");

account.tabIndex = 4;
account.id = "account";
account.innerHTML = `<a id="account-link" href="/inloggen.html">Inloggen</a>`;

nav.appendChild(account);

footer.classList.add("footer");
footer.innerHTML = `
    <p>Telefoon: (036) 123 45 67</p>
    <p>Adres: Almere Autopad 12</p>
`;

document.body.insertBefore(nav, document.body.firstChild);
document.body.append(footer);

if (sessionStorage.getItem("user")) {
    replaceLogin(user);
} else if (user) {
    APIRequest.request("/authorize", "GET", {
        authorization: constructAuthorization(user)
    }).then(async (response) => {
        /**
         * @type {APIResponse<TokenInfo>}
         */
        const { status, message } = await response.json();

        if (status == 200 && typeof message != "string") {
            const newUserObject = {
                ...user,
                ...message
            }
            const newUser = JSON.stringify(newUserObject);

            replaceLogin(newUserObject);

            if (!sessionStorage.getItem("disable-cache")) {
                Cookie.set("user", newUser, message.tokenExpiration);
            }

            sessionStorage.setItem("user", newUser);
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
    Cookie.delete("user");
    sessionStorage.removeItem("user");
}

/**
 * @param {User} user
 * @returns {void}
 */
function replaceLogin(user) {
    const account = document.querySelector("div#account");

    account.innerHTML = `
        <p>Account <i class=\"fas fa-user-circle\"></i></p>
        <div id="account-dropdown">
            <a tabindex="5" href="/account.html">Aanpassen</a>
            <p tabindex="6" id="logout">Uitloggen</p>
        </div>
    `;
    account.addEventListener("click", () => {
        const dropdown = document.querySelector("div#account-dropdown");

        dropdown.classList.toggle("show");
    });

    document.getElementById("logout").addEventListener("click", () => {
        logout();

        window.location.pathname = "/index.html";
    });

    if (user.permLevel >= 1) {
        const dropdown = document.getElementById("account-dropdown");
        const link = document.createElement("p");

        link.tabIndex = 7;
        link.innerText = "Beheer";
        link.addEventListener("click", () => {
            const form = document.createElement("form");

            form.style.display = "none";
            form.action = "/beheer/index.html";
            form.method = "post";
            form.innerHTML = `
                <input type="hidden" name="uuid" value="${user.uuid}">
                <input type="hidden" name="token" value="${user.token}">
            `;

            document.body.append(form);

            form.submit();
        });

        dropdown.append(link);
    }
}

/**
 * @param {DynamicObject<JSONPrimitive>} object 
 * @returns {string}
 */
function constructQuery(object) {
    return Object.entries(object).filter(
        // @ts-ignore It exists unless the value is null or undefined which should be filtered
        ([ _, value ]) => value?.__proto__
    ).map(([ key, value ]) => `${key}=${value}`).join("&");
}

/**
 * @param {User} user
 * @returns {string}
 */
function constructAuthorization({ uuid, token } = JSON.parse(Cookie.get("user"))) {
    return constructQuery({
        userId: uuid,
        token
    });
}