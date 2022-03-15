// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

APIRequest.request("/cars/available", "GET").then(async (cars) => {
    /**
     * @type {APIResponse<Car[]>}
     */
     const { status, message } = await cars.json();

     if (status == 200 && typeof message != "string") {
        const user = Cookie.get("user");

        if (sessionStorage.getItem("account") == "true" && user) {
            const userObject = JSON.parse(user);

            drawSelection(1, "to-hire", message);

            APIRequest.request(`/items/user/${userObject.uuid}`, "GET", {
                authorization: constructAuthorization(userObject)
            }).then(async (items) => {
                /**
                 * @type {APIResponse<RentItem[]>}
                 */
                const { status, message } = await items.json();

                if (status == 200 && typeof message != "string") {
                    drawSelection(1, "recent", message.map((item) => item.car));
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

    cars.forEach((car) => {
        const image = document.createElement("img");
        const button = images.getElementsByTagName("button")[0];
        image.src = `/resources/${car.image}`;
        image.alt = car.model;

        if (button) {
            images.insertBefore(image, button);
        } else {
            images.appendChild(image);
        }
    });
}