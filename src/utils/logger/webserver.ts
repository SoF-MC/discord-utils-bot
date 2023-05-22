import { createLogger, transports } from "winston";
import { createFileTransports, globalFormat } from ".";

const webserverLogger = createLogger({
    format: globalFormat,
    transports: [
        ...createFileTransports("webserver", ["info", "debug"]),
        new transports.Console({ level: "info", format: globalFormat })
    ]
});

export default webserverLogger;