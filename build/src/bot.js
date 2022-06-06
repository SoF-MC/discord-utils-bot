"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("nodejs-better-console").overrideConsole();
const discord_js_1 = __importStar(require("discord.js"));
const config_1 = __importDefault(require("../config"));
const commands_1 = require("./handlers/commands");
const client = new discord_js_1.default.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
    presence: { status: "dnd", activities: [{ type: "WATCHING", name: "загрузочный экран" }] }
});
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./database/"));
const Util_1 = __importDefault(require("./util/Util"));
Util_1.default.setClient(client).setDatabase(database_1.default);
global.client = client;
global.db = database_1.default;
client.once("ready", async () => {
    console.log(`Ready as ${client.user.tag}.`);
    (0, commands_1.registerCommands)(client).then(() => {
        console.log("Refreshed commands");
    });
    await database_1.default.global.reload();
    database_1.default.registerSchemas();
    const ticketChannel = client.channels.cache.get("962402003366051870");
    await ticketChannel.messages.fetch(database_1.default.global.get().ticketMessage)
        .then(async (m) => await m.edit({
        embeds: [{
                title: "Заявки",
                description: "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
            }],
        components: [new discord_js_1.MessageActionRow().addComponents([
                new discord_js_1.MessageButton()
                    .setLabel("Создать заявку")
                    .setCustomId("tickets:create")
                    .setStyle("PRIMARY")
            ])]
    }))
        .catch(async () => await ticketChannel.send({
        embeds: [{
                title: "Заявки",
                description: "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
            }],
        components: [new discord_js_1.MessageActionRow().addComponents([
                new discord_js_1.MessageButton()
                    .setLabel("Создать заявку")
                    .setCustomId("tickets:create")
                    .setStyle("PRIMARY")
            ])]
    }).then((m) => database_1.default.global.set("ticketMessage", m.id)));
    const guildMembers = await client.guilds.cache.get("764178286233518100").members.fetch();
    await Promise.all(guildMembers.map(async (member) => {
        const user = await Util_1.default.mongoose.model("userdata").findOne({ user: member.id });
        if (!user)
            await Util_1.default.mongoose.model("userdata").create({ user: member.id, permissions: 0 });
    }));
    updatePresence();
});
for (const file of fs_1.default.readdirSync(`${__dirname}/events`)) {
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, event);
}
;
const updatePresence = () => client.user.setPresence({ status: "online", activities: [{ type: "WATCHING", name: "#SoF 4?" }] });
client.on("rateLimit", (rateLimitInfo) => console.warn(`Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("warn", (info) => console.warn(`Warning. ${info}`));
database_1.default.connection.then(() => client.login(config_1.default.token));
process.on("unhandledRejection", (rej) => console.error(rej));
