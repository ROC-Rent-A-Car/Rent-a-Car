// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="../Cookie.js" />
/// <reference path="../APIRequest.js" />

/**
 * @implements {RenderObject}
 */
class Render {

    /**
     * @throws {Error}
     * @param {boolean} editable 
     * @param {boolean} creatable
     * @param {DynamicObject<Structure>} structure
     */
    constructor(editable, creatable, structure) {
        this._editable = editable;
        this._creatable = creatable;
        this._message = [];
        this._images = [];
        this._structure = structure;
        this._user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));

        if (this._user) {
            this._authorization = constructAuthorization(this._user || {});
        } else {
            throw new Error("No user found");
        }
    }
    
    /**
     * @returns {Promise<void>}
     */
    async build() {
        const headerRow = document.createElement("tr");
        const values = Object.values(this._structure);
        
        this._message = await this._gather();
        headerRow.innerHTML = "<th>" + Object.keys(this._structure).map(
            (key) => key.replace(/(?<=\s|^)(\w)/g, (char) => char.toUpperCase())
        ).join("</th><th>") + "</th>";

        if (values.findIndex((value) => value.type == "image") != -1) {
            await this._addUpload();
        }

        document.getElementById("content").append(
            headerRow,
            ...this._message.map((element, index) => {
                const row = document.createElement("tr");

                row.id = index.toString();
                row.append(...values.map(({ editable, type, key }) => {
                    const fullEditable = editable && this._editable;
                    const entry = document.createElement("td");

                    entry.classList.add(key.replace(/\s/g, "-"));

                    switch (type) {
                        case "number":
                        case "string": {
                            entry.innerHTML = `<input min="0" type="${
                                type == "number" ? "number" : "text"
                            }" value="${element[key]}" ${fullEditable ? "" : "readonly"}>`
                        } break;
                        case "image": {
                            entry.innerHTML = `<select ${fullEditable ? "" : "disabled"}>
                                ${this._images.map((image) => `<option value="${image}" ${
                                    image == element[key] ? "selected" : ""
                                }>${image.replace(/\.\w+$/, "")}</option>`).join("")}
                            </select>`;
                        } break;
                        case "perm": {
                            entry.innerHTML = `<select ${fullEditable ? "" : "disabled"}>
                                <option value="0" ${element[key] == 0 ? "selected" : ""}>Gebruiker</option>
                                <option value="1" ${element[key] == 1 ? "selected" : ""}>Beheerder</option>
                                <option value="2" ${element[key] == 2 ? "selected" : ""}>Administrator</option>
                            </select>`;
                        } break;
                        case "date": {
                            entry.innerHTML = `<input type="datetime-local" value="${
                                new Date(element[key]).toISOString().split(".")[0]
                            }" ${fullEditable ? "" : "readonly"}>`;
                        } break;
                        case "boolean": {
                            entry.innerHTML = `<input type="checkbox" ${
                                element[key] ? "checked" : ""
                            }  ${fullEditable ? "" : "readonly"}>`;
                        } break;
                    }

                    if (fullEditable) {
                        entry.addEventListener("change", (event) => this._edit(event, index, key));
                    }

                    return entry;
                }));

                return row;
            })
        );

        if (this._creatable) {
            this._addCreatable();
        }
    }

    /**
     * @abstract
     * @returns {Promise<TableBase[]>}
     */
     _gather() {
        throw new Error("Not implemented");
    }

    /**
     * @abstract
     * @param {Event} event 
     * @param {number} index 
     * @param {string} property 
     * @returns {void}
     */
    _edit(event, index, property) {
        throw new Error("Not implemented");
    }

    /**
     * @abstract
     * @param {Event} event 
     * @param {number} index 
     * @returns {Promise<TableBase>}
     */
    _create(event, index) {
        throw new Error("Not implemented");
    }

    /**
     * @abstract
     * @param {Event} event 
     * @param {number} index 
     * @returns {Promise<void>}
     */
    _delete(event, index) {
        throw new Error("Not implemented");
    }

    /**
     * @private
     */
    _addCreatable() {
        const createBtn = document.createElement("p");
        const deleteCallback = (row) => {
            const bin = document.createElement("td");

            bin.innerHTML = `<i class="fa-solid fa-trash"></i>`;
            bin.classList.add("delete");
            bin.addEventListener("click", (event) => {
                const id = parseInt(row.id);

                if (this._message[id]) {
                    this._delete(event, id).then(() => {
                        document.getElementById(row.id).remove();

                        delete this._message[id];
                    }).catch(console.error);
                } else {
                    document.getElementById(row.id).remove();
                }
            });
            row.append(bin);
        };

        createBtn.innerText = "Maak een nieuw object";
        createBtn.classList.add("create");
        createBtn.addEventListener("click", () => {
            const row = document.createElement("tr");
            let set = false;

            row.addEventListener("change", (event) => {
                const id = parseInt(row.id);

                if (set) {
                    // @ts-ignore
                    this._edit(event, id, event.target.parentElement.classList[0]);
                } else {
                    this._create(event, id).then((car) => {
                        this._message[id] = car;
                        set = true;
                    }).catch(console.error);
                }
            });
            
            row.id = document.getElementsByTagName("tr").length.toString();
            // This will completely ignore the editable property
            row.append(...Object.values(this._structure).map(({ type, key }) => {
                const entry = document.createElement("td");

                entry.classList.add(key.replace(/\s/g, "-"));

                switch (type) {
                    case "number":
                    case "string": {
                        entry.innerHTML = `<input min="0" type="${
                            type == "number" ? "number" : "text"
                        }" placeholder="_">`;
                    } break;
                    case "image": {
                        entry.innerHTML = `<select>
                            ${this._images.map((image) => `<option value="${image}">${
                                image.replace(/\.\w+$/, "")
                            }</option>`).join("")}
                        </select>`;
                    } break;
                    case "perm": {
                        // Not implementing this for now
                    } break;
                    case "date": {
                        // Not implementing this for now
                    } break;
                    case "boolean": {
                        entry.innerHTML = `<input type="checkbox">`;
                    } break;
                }

                return entry;
            }));

            deleteCallback(row);
            document.getElementById("content").append(row);
        });
        document.getElementById("table-holder").insertBefore(createBtn, document.getElementById("content"));

        [...document.getElementsByTagName("tr")].slice(1).forEach(deleteCallback);
    }

    /**
     * @private
     */
    async _addUpload() {
        const input = document.createElement("input");

        input.type = "file";
        input.setAttribute("data-text", "Upload een afbeelding");
        input.addEventListener("input", (event) => {
            let step = 0;
            // @ts-ignore
            const interval = setInterval(() => event.target.setAttribute(
                "data-text", 
                `Uploading${" ".repeat(step++ % 3)}.`
            ), 1000);
            const form = new FormData();

            // @ts-ignore
            form.append("file", event.target.files[0]);
            
            APIRequest.upload("/image", form, {
                authorization: this._authorization
            }).then(async (response) => {
                const { status, message } = await response.json();

                if (status == 200) {
                    const option = document.createElement("option");
                    // @ts-ignore
                    const name = event.target.files[0].name;

                    
                    option.value = name;
                    option.innerHTML = name.replace(/\.\w+$/, "");
                    
                    this._images.push(name);
                    Object.values(this._structure).filter((value) => value.type == "image").forEach((value) => [
                        ...document.querySelectorAll(`.${value.key} select`)
                    ].forEach((element) => element.append(option)));
                } else {
                    throw message;
                }
            }).catch(console.error);

            clearInterval(interval);                        
            // @ts-ignore
            event.target.setAttribute("data-text", "Upload een afbeelding");
        });

        this._images = (await (await APIRequest.request("/images", "GET")).json()).message;
        document.getElementById("content").parentElement.append(input);
    }
}