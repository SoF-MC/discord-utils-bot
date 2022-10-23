require("nodejs-better-console").overrideConsole();
import { ActivityType, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, TextChannel, ButtonStyle } from "discord.js";
import { registerCommands } from "./handlers/commands";
import config from "../config";
import Util from "./util/Util";
import db from "./database/";
import fs from "fs";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    presence: { status: "dnd", activities: [{ type: ActivityType.Watching, name: "загрузочный экран" }] }
});

Util.setClient(client).setDatabase(db);

global.client = client;
global.db = db;

client.once("ready", async () => {
    console.log(`Ready as ${client.user.tag}.`);

    registerCommands(client).then(() => {
        console.log("Refreshed commands");
    });
    await db.global.reload();

    const ticketChannel = client.channels.cache.get("962402003366051870") as TextChannel;
    await ticketChannel.messages.fetch(db.global.get().ticketMessage)
        .then((m) => m.edit({
            embeds: [{
                title: "Заявки",
                description: "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
            }],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder()
                    .setLabel("Создать заявку")
                    .setCustomId("tickets:create")
                    .setStyle(ButtonStyle.Primary)
            ])]
        }))
        .catch(() => ticketChannel.send({
            embeds: [{
                title: "Заявки",
                description: "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
            }],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder()
                    .setLabel("Создать заявку")
                    .setCustomId("tickets:create")
                    .setStyle(ButtonStyle.Primary)
            ])]
        }).then((m) => db.global.set("ticketMessage", m.id)));

    const guildMembers = await client.guilds.cache.get("764178286233518100").members.fetch();
    await Promise.all(guildMembers.map(async (member) => {
        const user = await Util.mongoose.model("userdata").findOne({ user: member.id });
        if (!user) await Util.mongoose.model("userdata").create({ user: member.id, permissions: 0 });
    }));

    updatePresence();
    setInterval(() => updatePresence(), 1000 * 60);
});

for (const file of fs.readdirSync(`${__dirname}/events`)) {
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, event);
};

const updatePresence = () => client.user.setPresence({ status: "online", activities: [{ type: ActivityType.Watching, name: "#SoF 4?" }] });

client.on("rateLimit", (rateLimitInfo) => console.warn(`Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("warn", (info) => console.warn(`Warning. ${info}`));

db.connection.then(() => client.login(config.token));

process.on("unhandledRejection", (rej) => console.error(rej));