import { Client, IntentsBitField, Partials } from "discord.js";
import fs from "node:fs/promises";
import { inspect } from "util";
import connection from "./database";
import handleInteractions from "./handlers/interactions";
import handleMentionCommands from "./handlers/mentionCommands";
import "./handlers/server";
import discordLogger from "./utils/logger/discord";
import mainLogger from "./utils/logger/main";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [Partials.Message]
});

client.once("ready", trueClient => {
    mainLogger.info(`Logged in as ${trueClient.user.tag}!`);

    handleInteractions(trueClient);
    handleMentionCommands(trueClient);
});

client
    .on("cacheSweep", message => void discordLogger.debug(message))
    .on("debug", info => void discordLogger.debug(info))
    .on("error", error => void discordLogger.error(`Error. ${inspect(error)}`))
    .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
    .on("warn", info => void discordLogger.warn(info));

process
    .on("uncaughtException", error => mainLogger.warn(`Uncaught exception: ${inspect(error)}`))
    .on("unhandledRejection", error => mainLogger.warn(`Unhandled rejection: ${inspect(error)}`));

void fs.stat("./playerdata").catch(() => fs.mkdir("./playerdata"));

void connection.then(() => void client.login());