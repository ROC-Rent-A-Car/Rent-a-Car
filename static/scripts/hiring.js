// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

/**
 * @type {Car[]}
 */
var available;

APIRequest.request("/cars/available", "GET").then(async (cars) => {
    /**
     * @type {APIResponse<Car[]>}
     */
     const { status, message } = await cars.json();

     if (status == 200 && typeof message != "string") {
        const user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
        available = message;

        if (user) {
            APIRequest.request(`/items/user/${user.uuid}`, "GET", {
                authorization: constructAuthorization(user)
            }).then(async (items) => {
                /**
                 * @type {APIResponse<RentItem[]>}
                 */
                const { status, message } = await items.json();

                if (status == 200 && typeof message != "string") {
                    if (message.length == 0) {
                        drawSelection(2, "to-hire", available);
                        document.getElementById("recent").remove();
                    } else {
                        drawSelection(1, "to-hire", available);
                        drawSelection(1, "recent", message.filter(
                            (item, index) => index == message.findIndex((subItem) => subItem.car.uuid == item.car.uuid)
                        ).map((item) => item.car));
                    }
                } else {
                    throw message;
                }
            }).catch(console.error);
        } else {
            document.getElementById("recent").remove();
            drawSelection(2, "to-hire", message);
        }
    } else {
        throw message;
    }
}).catch(console.error);

/**
 * @param {number} initialAmount 
 * @param {"recent"|"to-hire"} section 
 * @param {Car[]} cars
 * @returns {void}
 */
function drawSelection(initialAmount, section, cars) {    
    const button = document.createElement("button");
    let offset = 0;

    drawRows(section, cars.slice(offset, offset += initialAmount * 4));

    if (cars.length > offset) {
        button.innerText = "See more";

        button.classList.add("more");
        button.addEventListener("click", () => {
            drawRows(section, cars.slice(offset, offset += 4));

            if (cars.length <= offset) {
                button.remove();
            }
        });
        document.getElementById(`${section}-images`).appendChild(button);
    }
}

/**
 * @param {"recent"|"to-hire"} section
 * @param {Car[]} cars 
 * @returns {void}
 */
function drawRows(section, cars) {
    const images = document.getElementById(`${section}-images`);
    const button = images.getElementsByTagName("button")[0];

    cars.forEach((car) => {
        const container = document.createElement("div");
        const banner = document.createElement("div");
        const image = document.createElement("img");
        
        container.classList.add("cover");
        banner.innerHTML = `<b>${car.brand} - ${car.model}</b>`;
        banner.classList.add("banner");
        image.src = `/resources/${car.image}`;
        image.alt = car.model;

        container.appendChild(image);
        container.appendChild(banner);
        container.addEventListener("click", () => {
            window.location.href = `/details.html?${constructQuery(Object.fromEntries(Object.entries({
                ...car,
                hired: (available.find((aCar) => aCar.uuid == car.uuid) == undefined ? "true" : "false")
            }).map(
                ([ key, value ]) => [ 
                    key,
                    window.btoa(value.toString()).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "") 
                ]
            )))}`;
        });

        if (button) {
            images.insertBefore(container, button);
        } else {
            images.appendChild(container);
        }
    });
}