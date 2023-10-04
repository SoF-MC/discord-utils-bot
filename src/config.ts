import "dotenv/config";

export default {
    databaseUri: process.env["DATABASE_URI"]!,

    admins: process.env["ADMINS"]!.split(","),

    hastebinLink: process.env["HASTEBIN_LINK"]!,

    rcon: {
        main: {
            host: process.env["RCON_MAIN_HOST"]!,
            port: parseInt(process.env["RCON_MAIN_PORT"]!),
            password: process.env["RCON_MAIN_PASSWORD"]!,
        },
        plots: {
            host: process.env["RCON_PLOTS_HOST"]!,
            port: parseInt(process.env["RCON_PLOTS_PORT"]!),
            password: process.env["RCON_PLOTS_PASSWORD"]!,
        },
    },
};
