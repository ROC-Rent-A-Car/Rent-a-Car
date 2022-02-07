// @ts-check

fetch(new Request("/api/v1/cars/top", {
    method: "GET"
})).then(async (response) => {
    if (response.status == 200) {
        document.getElementById("cars").innerHTML = Object.values(await response.json())
            .map(({ image }) => `<img src="${image}" alt="car">`).join("");
    }
}).catch(console.error);