// @ts-check
/// <reference path="index.d.ts" />
/// <reference path="SetupRender.js" />
/// <reference path="UserRender.js" />
/// <reference path="CarRender.js" />
/// <reference path="../Cookie.js" />
/// <reference path="../APIRequest.js" />


var user = JSON.parse(Cookie.get("user") || sessionStorage.getItem("user"));
var authorization = constructAuthorization(user);

APIRequest.request("/permissions", "GET",  {
    authorization
}).then(async (permissions) => {
    /**
     * @type {APIResponse<(keyof APIObject)[]>}
     */
    const { status, message } = await permissions.json();
    
    if (status == 200 && typeof message != "string") {
        const selection = document.getElementById("selection");

        /**
         * @type {TabObject[]}
         */
        ([
            {
                name: "Klaarzetten",
                setupClass: SetupRender,
                permission: "rent_history_permission",
                editPermission: "setup_status_toggle_permission"
            },
            {
                name: "Gebruikers",
                setupClass: UserRender,
                permission: "user_view_permission",
                editPermission: "change_perm_level_permission"
            },
            {
                name: "Auto's",
                setupClass: CarRender,
                permission: undefined,
                editPermission: "car_edit_permission"
            }
        ]).filter((tab) => !tab.permission || message.includes(tab.permission)).forEach((tab, index) => {
            const tabElement = document.createElement("p");
            const render = new tab.setupClass(message.includes(tab.editPermission));

            tabElement.innerText = tab.name;
            tabElement.addEventListener("click", (event) => {
                const table = document.getElementById("content");
                const active = document.getElementsByClassName("active")[0];

                table.innerHTML = "";
                active.classList.remove("active");
                // @ts-ignore
                event.target.classList.add("active");

                render.build();
            });

            if (index == 0) {
                render.build();
                tabElement.classList.add("active");
            }

            selection.appendChild(tabElement);
        });
    } else {
        throw message;
    }
}).catch(console.error);