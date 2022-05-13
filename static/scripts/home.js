// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="APIRequest.js" />

APIRequest.request("/cars/top", "GET").then(async (response) => {
    /**
     * @type {APIResponse<Car[]>}
     */
    const { status, message } = await response.json();

    if (status == 200) {
        const halfSize = Math.floor(Math.min(message.length, 6) / 2);
        const cars = Object.values(message);

        document.getElementById("cars").innerHTML += cars.slice(0, 5).map(
            ({ image }, index) => {
                const indent = halfSize - index;

                return `<img 
                    style="
                        z-index: ${indent - Math.abs(indent)};
                        right: calc(40vw - ${indent * -15}vw); 
                        filter: 
                            brightness(${1 - Math.abs(indent * 0.2)}) 
                            blur(${Math.abs(indent * 2)}px)
                        ;
                    " 
                    src="/resources/${image}" 
                    alt="car"
                >`;
            }
        ).join("");

        document.getElementById("left").addEventListener("click", () => {
            cars.push(cars.shift());

            [...document.getElementById("cars").getElementsByTagName("img")].forEach(
                (img, index) => img.src = `/resources/${cars[index].image}`
            );
        });

        document.getElementById("right").addEventListener("click", () => {
            cars.push(cars.reverse().shift());
            cars.reverse();

            [...document.getElementById("cars").getElementsByTagName("img")].forEach(
                (img, index) => img.src = `/resources/${cars[index].image}`
            );
        });
    } else {
        throw message;
    }
}).catch(console.error);