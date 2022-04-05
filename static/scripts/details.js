// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var user = Cookie.get("user") || sessionStorage.getItem("user");
var { uuid, model, description, price, image } = Object.fromEntries([
    ...new URLSearchParams(window.location.search).entries()
].map(([ key, value ]) => [ key, window.atob(value.replace(/_/g, "/").replace(/-/g, "+")) ]));


if ([ model, description, price, image ].every(Boolean)) {
    const canHire = "true" == "true";

    // @ts-ignore The dom type definitions do not extend properly
    document.getElementById("preview").src = image;
    document.getElementById("name").innerText = model;
    document.getElementById("description").innerText = description == "null" ? "Geen beschrijving beschikbaar." : description;
    document.getElementById("availability").innerText = canHire ? "beschikbaar" : "onbeschikbaar";
    document.getElementById("price").innerText = "€" + price;

    if (user && canHire) {
        document.querySelector(`input[type="submit"]`).addEventListener("click", (event) => {
            event.preventDefault();

            APIRequest.request("/item", "PUT", {
                authorization: constructAuthorization(JSON.parse(user))
            }, {
                car: uuid,
                days: 7, // TODO: Implement a selection
                from: new Date().getTime() // TODO: Implement a selection
            }).then(async (response) => {
                const { status, message } = await response.json();

                if (status == 201 && typeof message != "string") {
                    
                } else {
                    throw message;
                }
            }).catch(console.error);
        });
    } else {
        document.querySelector(`input[type="submit"]`).remove();
    }
} else {
    document.querySelector(`input[type="submit"]`).remove();
}