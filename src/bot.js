require("./extendedMessage");
const Discord = require("discord.js");
const config = require("../config");
const commandHandler = require("./handlers/commands");
const client = new Discord.Client({
    partials: ["GUILD_MEMBER", "MESSAGE"],
    presence: {
        status: "dnd",
        activity: {
            type: "WATCHING",
            name: "загрузочный экран"
        }
    }
});
const log = require("./handlers/logger");
const fs = require("fs");
const db = require("./database/")();
const { deleteMessage } = require("./handlers/utils");

global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
global.getInvite = require("./constants/").getInvite;
global.msToTime = require("./constants/").msToTime;
global.plurify = require("./constants/").plurify;
global.exec = require("child_process").exec;
global.si = require("systeminformation");
global.fetch = require("node-fetch");
global.root = __dirname;
global.client = client;
global.log = log;
global.db = db;
client.delMsg = require("./handlers/utils").deleteMessage;

let shard = "[Shard N/A]";

client.once("shardReady", async (shardid, unavailable = new Set()) => {
    shard = `[Shard ${shardid}]`;
    log.log(`${shard} Ready as ${client.user.tag}! Caching guilds.`);

    client.loading = true;

    let disabledGuilds = new Set([...Array.from(unavailable), ...client.guilds.cache.map(guild => guild.id)]);
    let guildCachingStart = Date.now();

    await db.cacheGuilds(disabledGuilds);
    log.log(`${shard} All ${disabledGuilds.size} guilds have been cached. [${Date.now() - guildCachingStart}ms]`);

    let userCachingStart = Date.now();
    await Promise.all(client.guilds.cache.map(guild => guild.members.fetch()));
    log.log(`${shard} All ${client.users.cache.size} users have been cached. [${Date.now() - userCachingStart}ms]`);

    disabledGuilds.size = 0;
    client.loading = false;

    await updatePresence();
    client.setInterval(updatePresence, 10000); // 10 seconds

    fs.readdir("./src/modules", (err, files) => {
        err ? log.error(err) : files.filter(file => file.endsWith(".js")).forEach(file => require(`./modules/${file}`)(client));
    });
});

client.on("message", async message => {
    global.msg = message;

    if (message.channel.id == "893204926627463228") return message.crosspost();

    if (
        !message.guild ||
        message.author.bot ||
        message.type !== "DEFAULT"
    ) return;

    const gdb = await db.guild(message.guild.id);
    global.gdb = gdb;
    global.gldb = db.global;

    if (!!gdb.get().mutes[message.author.id]) return deleteMessage(message);

    let { prefix } = gdb.get();
    if (!prefix.length) prefix = config.prefix;

    if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) return commandHandler(message, prefix, gdb, db);
    if (message.content.match(`^<@!?${client.user.id}>`)) return message.reply(`👋 Мой префикс на этом сервере \`${prefix}\`, для помощи напишите \`${prefix}help\`.`);
});

const updatePresence = async () => {
    let name = `#SoF 3`;
    return client.user.setPresence({
        status: "online",
        activity: { type: "WATCHING", name }
    });
};

client
    .on("error", err => log.error(`${shard} Client error. ${err}`))
    .on("rateLimit", rateLimitInfo => log.warn(`${shard} Rate limited.\n${JSON.stringify(rateLimitInfo)}`))
    .on("shardDisconnected", closeEvent => log.warn(`${shard} Disconnected. ${closeEvent}`))
    .on("shardError", err => log.error(`${shard} Error. ${err}`))
    .on("shardReconnecting", () => log.log(`${shard} Reconnecting.`))
    .on("shardResume", (_, replayedEvents) => log.log(`${shard} Resumed. ${replayedEvents} replayed events.`))
    .on("warn", info => log.warn(`${shard} Warning. ${info}`))

db.connection.then(() => client.login(config.token));

process.on("unhandledRejection", rej => log.error(rej.stack));
