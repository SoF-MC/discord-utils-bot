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
const client = new discord_js_1.default.Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers"],
    presence: { status: "dnd", activities: [{ type: discord_js_1.ActivityType.Watching, name: "загрузочный экран" }] }
});
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./database/"));
const Util_1 = __importDefault(require("./util/Util"));
Util_1.default.setClient(client).setDatabase(database_1.default);
global.client = client;
global.db = database_1.default;
client.once("ready", async () => {
    console.log(`Ready as ${client.user.tag}! Caching guilds.`);
    await database_1.default.global.reload();
    updatePresence();
});
for (const file of fs_1.default.readdirSync(`${__dirname}/events`)) {
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, event);
}
;
const updatePresence = () => client.user.setPresence({ status: "online", activities: [{ type: discord_js_1.ActivityType.Watching, name: "#SoF 4?" }] });
client.on("error", (err) => console.error(`Client error. ${err}`));
client.on("rateLimit", (rateLimitInfo) => console.warn(`Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("shardDisconnected", (closeEvent) => console.warn(`Disconnected. ${closeEvent}`));
client.on("shardError", (err) => console.error(`Error. ${err}`));
client.on("warn", (info) => console.warn(`Warning. ${info}`));
database_1.default.connection.then(() => client.login(config_1.default.token));
process.on("unhandledRejection", (rej) => console.error(rej));
