import { join } from "path";
import { Pool } from "pg";
import express from "express";
import { appendFileSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { BetterArray, DevConsole, DynamicObject, Status } from "std-node";
import { urlencoded } from "body-parser";
import { Settings } from "./utils/Settings";
import { config } from "dotenv";
import { Authorize } from "./utils/Authorize";
import { PermLevel } from "./enums/PermLevel";

// Configuring the .env variables which serve as the private settings, these won't be committed to GitHub
config();

// Configuring and exporting the global public settings
export const SETTINGS = new Settings(JSON.parse(readFileSync(join(__dirname, "../settings.json"), "utf8")));
// Making the web app
export const APP = express();
// If a port env variable was provided the instance should be considered an automated deployment
export const DEPLOYMENT = typeof process.env.PORT != "undefined";
// Making a pool connection
export const DB = DEPLOYMENT ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}) : new Pool({
    ...SETTINGS.get("data"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});


// Storing the web settings in a variable to avoid repeated function calls
const web = SETTINGS.get("web");
const controllers = join(__dirname, "controllers/");

// Storing the output log file paths and current date
const logsDir = join(__dirname, "../logs");
const date = new Date();

// Storing some basic variables required to sample requests
const security = SETTINGS.get("security");
const sampleInteractions = {
    totalInteractions: 0,
    ipInteractions: <DynamicObject<number>>{},
    endpointInteractions: <DynamicObject<number>>{}
};

// Sample interactions cleanup routine
setInterval(() => {
    sampleInteractions.totalInteractions = 0;
    sampleInteractions.ipInteractions = {};
    sampleInteractions.endpointInteractions = {};
}, security.warning_sample_length * 1e3);

// Listening and logging database errors
DB.on("error", DevConsole.error);

// Saving logs
mkdirSync(logsDir);

[
    "info",
    "warn",
    "error"
].forEach((type) => {
    const logsFile = join(logsDir, `${type}.log`);

    DevConsole.on(type, (log) => appendFileSync(logsFile, `${log.split(/\x1b\[\d{1,2}m/).join("")}\n`));
    appendFileSync(logsFile, `----======== Instance started at ${
        new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleString("en-GB")
    } =========----\n`);
});


// Setting a logger and general security checker
APP.use((request, response, next) => {
    const blacklist = JSON.parse(readFileSync(join(__dirname, "../blacklist.json"), "utf8"));

    if (
        !blacklist.includes(request.ip) && 
        (!request.ip.includes(":") || !blacklist.includes(request.ip.split(":")[1]))
    ) {
        // If this doesn't work then sorry but I'm not going to buy a domain just to check if this keeps giving the default IP
        DevConsole.info("\x1b[34m%s\x1b[0m requested \x1b[34m%s\x1b[0m", request.ip, request.url);

        sampleInteractions.totalInteractions++;
        sampleInteractions.ipInteractions[request.ip] = (sampleInteractions.ipInteractions[request.ip] ?? 0) + 1;
        sampleInteractions.ipInteractions[request.path] = (sampleInteractions.ipInteractions[request.path] ?? 0) + 1;

        const ipOverload = request.ip != "127.0.0.1" && sampleInteractions.ipInteractions[
            request.ip
        ] >= security.ip_specific_requests_before_warning;
        const endpointOverload = sampleInteractions.ipInteractions[
            request.path
        ] >= security.endpoint_specific_requests_before_warning;

        if (ipOverload || endpointOverload) {
            alarmLog(ipOverload ? request.ip : "Varied", endpointOverload ? request.path : "Varied");
        } else if (sampleInteractions.totalInteractions >= security.requests_before_warning) {
            alarmLog();
        }

        next();
    } else {
        response.status(Status.FORBIDDEN).send("Minimizing packet size");
    }
});

// Setting POST field settings
APP.use(urlencoded({ 
    extended: true ,
    limit: `${web.max_packet_size}mb`
}));
APP.use(express.json({
    limit: `${web.max_packet_size}mb`
}));

// Setting the static files
APP.use(express.static(join(__dirname, "../static")));

// Setting a mandatory authorization for the staff endpoint
APP.use("/beheer", (request, response) => {
    if (
        request.method == "POST" &&
        request.body.uuid && 
        request.body.token && 
        new Authorize().isAuthorized(request.ip, request.body.uuid, request.body.token, PermLevel.EMPLOYEE)
    ) {
        response.status(Status.OK).sendFile(join(__dirname, "../static/beheer/index.html"));
    } else {
        response.status(Status.NOT_FOUND).redirect("/errors/404.html");
    }
});

// Iterating over all the controllers to establish them as API endpoints
BetterArray.from(readdirSync(controllers)).asyncMap(
    async (endpoint) => new (await import(join(controllers, endpoint)))[endpoint.split(".")[0]]()
).then(() => {
    const port = parseInt(<string>process.env.PORT) || web.port;
    const successCallback = () => DevConsole.info(
        "Listening to \x1b[34m%s:%s\x1b[0m", 
        web.host, 
        port.toString()
    );
    APP.use((request, response) => {
        response.status(Status.NOT_FOUND);

        if (request.url == "/favicon.ico") {
            // Silently ignore favicon
            response.redirect("/resources/placeholder.png");
        } else {
            DevConsole.info(
                "Item requested by \x1b[34m%s\x1b[0m not found on \x1b[34m%s\x1b[0m, accepting: \"\x1b[34m%s\x1b[0m\"", 
                request.ip,
                request.url,
                request.headers.accept ?? ""
            );

            if (request.accepts("image")) {
                response.redirect("/resources/placeholder.png");
            } else if (request.accepts("text/plain")) {
                response.send("Not found");
            } else if (request.accepts("html")) {
                response.redirect("/errors/404.html");
            } else {
                response.json({
                    status: Status.NOT_FOUND,
                    message: "Not found"
                });
            }
        }
    });

    // Starting the web app
    if (DEPLOYMENT) {
        APP.listen(port, successCallback);
    } else {
        APP.listen(port, web.host, successCallback);
    }
});

// Declaring an alarm logging method
function alarmLog(ip: string = "Varied", endpoint: string = "Varied"): void {
    [
        "--------------- !!! WARNING !!! ---------------",
        "",
        "An elevated amount of requests was detected!",
        `Endpoint: ${endpoint}, IP: ${ip}`,
        "",
        "-----------------------------------------------"
    ].forEach((log) => DevConsole.warn("\x1b[1m\x1b[3m%s\x1b[0m", log));
}