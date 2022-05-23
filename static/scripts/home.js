// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="Cookie.js" />

var resetEvent;
var date = new Date(Date.now() + 864e5);

[
    "from",
    "to"
].forEach((id, index) => {
    /**
     * @type {HTMLInputElement}
     */
    const input = document.querySelector(`#${id}`);

    if (index) {
        date.setDate(date.getDate() + 1);
    } else {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    }

    const timeString = date.toISOString().split(/:\d{2}\./)[0].replace("T", " ");
    
    input.value = timeString;
    input.min = timeString;
});

// @ts-ignore
$(() => $("input[type=picker]").datetimepicker({ dateFormat: "yy-mm-dd" }));

document.getElementById("form").addEventListener("submit", (event) => {
    // @ts-ignore
    const from = +new Date(document.getElementById("from").value);
    // @ts-ignore
    const to = +new Date(document.getElementById("to").value); 

    event.preventDefault();

    if (!isNaN(from) && !isNaN(to)) {
        if (from > Date.now()) {
            const deltaDay = Math.ceil((to - from) / 864e5);

            if (deltaDay) {
                window.location.href = `/huren.html?${constructQuery({ from, to })}`;
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