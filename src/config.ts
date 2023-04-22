import "dotenv/config";

export default {
    token: String(process.env["DISCORD_TOKEN"]),
    database: String(process.env["DATABASE_URI"]),

    owners: String(process.env["OWNERS"]).split(",") as [string, ...string[]],
    autoregChannelId: String(process.env["AUTOREG_CHANNEL_ID"]),
    guildId: String(process.env["GUILD_ID"]),

    hastebin: String(process.env["HASTEBIN_URL"]),

    rcon: {
        host: String(process.env["RCON_HOST"]),
        port: Number(process.env["RCON_PORT"]),
        password: String(process.env["RCON_PASSWORD"])
    }
} as const;