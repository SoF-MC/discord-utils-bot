require("nodejs-better-console").overrideConsole();
const Discord = require("discord.js");
const config = require("../config");
const commandHandler = require("./handlers/commands");
const client = new Discord.Client({
    makeCache: Discord.Options.cacheWithLimits({
        GuildScheduledEventManager: 0,
        BaseGuildEmojiManager: 0,
        GuildStickerManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: 0,
        GuildEmojiManager: 0,
        GuildBanManager: 0,
        MessageManager: 512
    }),
    intents: ["GUILDS", "GUILD_MESSAGES"],
    presence: { status: "dnd", activities: [{ type: "WATCHING", name: "загрузочный экран" }] }
});
const fs = require("fs");
const db = require("./database/");

global.client = client;
global.db = db;

let shard = "[Shard N/A]";

client.once("shardReady", async (shardid, unavailable = new Set()) => {
    shard = `[Shard ${shardid}]`;
    console.log(`${shard} Ready as ${client.user.tag}! Caching guilds.`);

    client.loading = true;

    let disabledGuilds = new Set([...Array.from(unavailable), ...client.guilds.cache.map(guild => guild.id)]);
    let guildCachingStart = Date.now();

    await db.cacheGuilds(disabledGuilds);
    console.log(`${shard} All ${disabledGuilds.size} guilds have been cached. [${Date.now() - guildCachingStart}ms]`);

    disabledGuilds = null;
    client.loading = false;
    await db.global.reload();

    await updatePresence();
    client.setInterval(updatePresence, 60 * 1000); // 1 minute

    fs.readdir("./src/modules", (err, files) => {
        err ? console.error(err) : files.filter(file => file.endsWith(".js")).forEach(file => require(`./modules/${file}`)(client));
    });
});

client.on("message", async message => {
    global.msg = message;

    if (
        !message.guild ||
        message.author.bot
    ) return;

    const gdb = await db.guild(message.guild.id);
    global.gdb = gdb;
    global.gldb = db.global;

    if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) return commandHandler(message, prefix, gdb, db);
});

const updatePresence = () => client.user.setPresence({ status: "online", activities: [{ type: "WATCHING", name: "#SoF 4?" }] });

client.on("error", err => console.error(`${shard} Client error. ${err}`));
client.on("rateLimit", rateLimitInfo => console.warn(`${shard} Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("shardDisconnected", closeEvent => console.warn(`${shard} Disconnected. ${closeEvent}`));
client.on("shardError", err => console.error(`${shard} Error. ${err}`));
client.on("shardReconnecting", () => console.log(`${shard} Reconnecting.`));
client.on("shardResume", (_, replayedEvents) => console.log(`${shard} Resumed. ${replayedEvents} replayed events.`));
client.on("warn", info => console.warn(`${shard} Warning. ${info}`));

db.connection.then(() => client.login(config.token));

process.on("unhandledRejection", rej => console.error(rej));