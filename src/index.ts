import { join } from "path";
import { Pool } from "pg";
import express from "express";
import { readFileSync } from "fs";
import { DevConsole } from "std-node";
import { json, urlencoded } from "body-parser";
import { Settings } from "./utils/Settings";
import { config } from "dotenv";
import { extensions } from "./constants/extensions";

// Configuring the .env variables which serve as the private settings, these won't be committed to GitHub
config();

// Configuring and exporting the global public settings
export const SETTINGS = new Settings(JSON.parse(readFileSync(join(__dirname, "../settings.json"), "utf8")));
// Making the web app
export const APP = express();
// Making a pool connection
export const DB = new Pool({
    ...SETTINGS.get("database"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Storing the web settings in a variable to avoid repeated function calls
const web = SETTINGS.get("web");

// Listening and logging database errors
DB.on("error", DevConsole.error);

// Starting the web app listening
APP.listen(web.port, web.host, () => DevConsole.info("Listening to \x1b[34m%s:%s\x1b[0m", web.host, web.port.toString()));

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
extensions.get("Controller")?.forEach((child) => new child());

// BetterArray.from(readdirSync(controllers))
//     .asyncMap(async (endpoint) => new (await import(join(controllers, endpoint)))[endpoint.split(".")[0]]());