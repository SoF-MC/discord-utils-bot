require("nodejs-better-console").overrideConsole();
import Discord, { ActivityType } from "discord.js";
import config from "../config";
import { registerCommands } from "./handlers/commands";
const client = new Discord.Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers"],
    presence: { status: "dnd", activities: [{ type: ActivityType.Watching, name: "загрузочный экран" }] }
});
import fs from "fs";
import db from "./database/";
import Util from "./util/Util";

Util.setClient(client).setDatabase(db);

global.client = client;
global.db = db;

client.once("ready", async () => {
    console.log(`Ready as ${client.user.tag}! Caching guilds.`);

    //await registerCommands(client);
    await db.global.reload();

    updatePresence();
});

for (const file of fs.readdirSync(`${__dirname}/events`)) {
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];

    client.on(eventName, event);
};

const updatePresence = () => client.user.setPresence({ status: "online", activities: [{ type: ActivityType.Watching, name: "#SoF 4?" }] });

client.on("error", (err) => console.error(`Client error. ${err}`));
client.on("rateLimit", (rateLimitInfo) => console.warn(`Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("shardDisconnected", (closeEvent) => console.warn(`Disconnected. ${closeEvent}`));
client.on("shardError", (err) => console.error(`Error. ${err}`));
client.on("warn", (info) => console.warn(`Warning. ${info}`));

db.connection.then(() => client.login(config.token));

process.on("unhandledRejection", (rej) => console.error(rej));