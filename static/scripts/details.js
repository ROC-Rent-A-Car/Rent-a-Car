// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />
/// <reference path="APIRequest.js" />

var resetEvent;
var user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
var params = new URLSearchParams(window.location.search);
var uuid = params.get("uuid");
var now = Date.now();
var date = new Date(now + 72e5);

[
    "from",
    "to"
].forEach((id, index) => {
    /**
     * @type {HTMLInputElement}
     */
    const input = document.querySelector(`#${id}`);
    const param = params.get(id);
    const paramDate = new Date(parseInt(param));
    const fillDate = isNaN(+paramDate) ? new Date(now + 72e5) : paramDate;

    if (index) {
        date.setDate(date.getDate() + 1);
    } else {
        // Whoever decided to not implement the local part in datetime-local should find a different job
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    }
    
    input.value = new Date(
        fillDate.setMinutes(fillDate.getMinutes() - date.getTimezoneOffset())
    ).toISOString().split(/:\d{2}\./)[0].replace("T", " ");
    input.min = date.toISOString().split(/:\d{2}\./)[0].replace("T", " ");
});

if (uuid) {
    APIRequest.request(`/cars/specific/${uuid}`, "GET").then(async (response) => {
        /**
         * @type {APIResponse<Car[]>}
         */
        const { status, message } = await response.json();

        if (status == 200 && typeof message != "string" && message.length == 1) {
            const [ car ] = message;

            APIRequest.request(`/unavailable/${uuid}`, "GET").then(async (response) => {
                /**
                 * @type {APIResponse<DateRange[]>}
                 */
                const { status, message } = await response.json();

                if (status == 200 && typeof message != "string") {
                    const now = Date.now();

                    // @ts-ignore The dom type definitions do not extend properly
                    document.getElementById("preview").src = "/resources/" + car.image;
                    document.getElementById("name").innerText = car.model;
                    document.getElementById("description").innerText = car.description ?? "Geen beschrijving beschikbaar.";
                    document.getElementById("availability").innerText = message.some(
                        (range) => range.from <= now && range.to > now
                    ) ? "niet beschikbaar" : "beschikbaar";
                    document.getElementById("price").innerText = "€" + (
                        car.price % 1 == 0 ? car.price + ",-" : car.price.toFixed(2).replace(".", ",")
                    );

                    // @ts-ignore
                    $(() => [
                        "from",
                        "to"
                    // @ts-ignore
                    ].forEach((id) => $(`#${id}`).datetimepicker({
                        timeFormat: "HH:mm",
                        dateFormat: "yy-mm-dd",
                        beforeShowDay: (date) => {
                            const currentDate = new Date();

                            return [
                                currentDate.setDate(
                                    currentDate.getDate() + +(id == "to")
                                ) < +date && !isInDateRange(date, message)
                            ];
                        }
                    })));

                    if (user) {
                        document.querySelector(`input[type="submit"]`).addEventListener("click", (event) => {
                            // @ts-ignore
                            const from = new Date(document.getElementById("from").value);
                            // @ts-ignore
                            const to = new Date(document.getElementById("to").value);
                            
                            event.preventDefault();
                            
                            if (!isNaN(+from) && !isNaN(+to)) {
                                if (+from > Date.now()) {
                                    const deltaDay = Math.ceil((+to - +from) / 864e5);

                                    if (deltaDay) {
                                        APIRequest.request("/item", "PUT", {
                                            authorization: constructAuthorization(user)
                                        }, {
                                            car: uuid,
                                            days: deltaDay,
                                            from: +from
                                        }).then(async (response) => {
                                            const { status, message } = await response.json();
                            
                                            if (status == 201 && typeof message != "string") {
                                                window.location.href = "/gehuurd.html";
                                            } else {
                                                throw message;
                                            }
                                        }).catch(console.error);
                                    } else {
                                        show("De datum moet minstens één dag later zijn.", "red");
                                    }
                                } else {
                                    show("De datum moet minstens later vandaag zijn.", "red");
                                }
                            } else {
                                show("De datum moet een geldige datum zijn.", "red");
                            }
                        });
                    } else {
                        document.querySelector(`input[type="submit"]`).addEventListener("click", (event) => {
                            event.preventDefault();

                            window.location.href = "/login";
                        });
                    }
                } else {
                    throw message; // If this triggers I will literally blame cosmic rays
                }
            }).catch(console.error);
        } else {
            throw message;
        }
    }).catch(console.error);
}

/**
 * @param {string} message 
 * @param {string} color 
 * @returns {void}
 */
 function show(message, color) {
    const messageNode = document.getElementById("message");
    
    messageNode.style.color = color;
    messageNode.innerText = message;
    resetEvent = setTimeout(() => messageNode.innerText = "", 3e3);
}

/**
 * @param {Date} date
 * @param {DateRange[]} ranges
 * @returns {boolean} 
 */
function isInDateRange(date, ranges) {
    return ranges.some(({ from, to }) => from - 2592e5 <= +date && +date < to + 864e5); 
}