import { join } from "path";
import { Pool } from "pg";
import express from "express";
import { readdirSync, readFileSync } from "fs";
import { BetterArray, DevConsole } from "std-node";
import { json, urlencoded } from "body-parser";
import { Settings } from "./utils/Settings";
import { config } from "dotenv";

// Configuring the .env variables which serve as the private settings, these won't be committed to GitHub
config();

// Configuring and exporting the global public settings
export const SETTINGS = new Settings(JSON.parse(readFileSync(join(__dirname, "../settings.json"), "utf8")));
// Making the web app
export const APP = express();
// Making a pool connection
export const DB = new Pool({
    ...SETTINGS.get("data"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Storing the web settings in a variable to avoid repeated function calls
const web = SETTINGS.get("web");
const controllers = join(__dirname, "controllers/");

// Listening and logging database errors
DB.on("error", DevConsole.error);

// Setting POST field settings
APP.use(urlencoded({ 
    extended: true ,
    limit: `${web.max_packet_size}mb`
}));
APP.use(json({ 
    limit: `${web.max_packet_size}mb`
}));

// Setting the static files
APP.use(express.static(join(__dirname, "../static")));

// Iterating over all the controllers to establish them as API endpoints
BetterArray.from(readdirSync(controllers))
    .asyncMap(async (endpoint) => new (await import(join(controllers, endpoint)))[endpoint.split(".")[0]]())
    .then(() => 
        // Starting the web app
        APP.listen(web.port, web.host, () => DevConsole.info("Listening to \x1b[34m%s:%s\x1b[0m", web.host, web.port.toString())));

APP.use((req, res) => {
    res.status(404);

    if (req.accepts("html")) {
        res.redirect("/errors/404.html");
    } else if (req.accepts("text/plain")) {
        res.send("Not found");
    } else {
        res.json({
            status: 404,
            message: "Not found"
        });
    }
});