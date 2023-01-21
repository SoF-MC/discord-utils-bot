import "dotenv/config";

export default {
    databaseUri: process.env["DATABASE_URI"]!,

    admins: process.env["ADMINS"]!.split(","),

    hastebinLink: process.env["HASTEBIN_LINK"]!,

    rcon: {
        host: process.env["RCON_HOST"]!,
        port: parseInt(process.env["RCON_PORT"]!),
        password: process.env["RCON_PASSWORD"]!
    }
};