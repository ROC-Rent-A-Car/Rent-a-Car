// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="../Cookie.js" />

/**
 * @implements {RenderObject}
 */
class Render {

    /**
     * @throws {Error}
     * @param {boolean} editable 
     */
    constructor(editable) {
        this._editable = editable;
        this._user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));

        if (this._user) {
            this._authorization = constructAuthorization(this._user || {});
        } else {
            throw new Error("No user found");
        }
    }
    
    build() {
        this._render().then((structure) => {
            if (structure.length > 0) {
                const headerRow = document.createElement("tr");

                headerRow.innerHTML = "<th>" + Object.keys(structure[0]).join("</th><th>") + "</th>";

                document.getElementById("content").append(
                    headerRow,
                    ...structure.map((element, index) => {
                        const row = document.createElement("tr");
        
                        row.append(...Object.entries(element).map(([ baseKey, { key, value, editable } ]) => {
                            const fullEditable = editable && this._editable;
                            const entry = document.createElement("td");
        
                            entry.classList.add(baseKey.replace(/\s/g, "-"));
                            
                            if (typeof value == "boolean") {
                                entry.innerHTML = `<input type="checkbox" ${
                                    value ? "checked" : ""
                                } ${fullEditable ? "" : "readonly"}>`;
                            } else if (value instanceof Date) {
                                entry.innerHTML = `<input type="datetime-local" value="${
                                    value.toISOString().split(".")[0]
                                }" ${fullEditable ? "" : "readonly"}>`;
                            } else {
                                entry.innerHTML = `<input min="0" type="${
                                    typeof value == "number" ? "number" : "text"
                                }" value="${value}" ${fullEditable ? "" : "readonly"}>`
                            }
        
                            entry.addEventListener("change", (event) => this._edit(event, index, key));
        
                            return entry;
                        }));
        
                        return row;
                    })
                );
            }
        }).catch(console.error);
    }

    /**
     * @abstract
     * @returns {Promise<DynamicObject<TableEntry>[]>}
     */
    _render() {
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
}