// @ts-check

const imageSelection = document.createElement("div");
const images = [
    "placeholder.png",
    "placeholder.png",
    "placeholder.png",
    "placeholder.png",
    "placeholder.png"
];
const halfSize = Math.floor(images.length / 2);

imageSelection.classList.add("image-selection");
imageSelection.innerHTML = images.map((image, index) => {
    const indent = halfSize - index;

    return `<img 
        alt="car"
        style="
            z-index: ${indent - Math.abs(indent)};
            right: calc(40vw - ${indent * -15}vw); 
            filter: 
                brightness(${1 - Math.abs(indent * 0.2)}) 
                blur(${Math.abs(indent * 2)}px)
            ;
        " 
        src="resources/${image}"
    >`;
}).join("") + `
    <span class="navigation-button left"></span>
    <span class="navigation-button"></span>
`;

document.body.insertBefore(imageSelection, document.body.firstChild.nextSibling);

fetch(new Request("/api/v1/cars/top", {
    method: "GET"
})).then(async (response) => {
    if (response.status == 200) {
        document.getElementById("cars").innerHTML = Object.values(await response.json())
            .map(({ image }) => `<img src="${image}" alt="car">`).join("");
    }
}).catch(console.error);