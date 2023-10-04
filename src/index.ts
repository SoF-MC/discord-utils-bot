import {
    ActivityType,
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    TextChannel,
    ButtonStyle,
} from "discord.js";
import { registerCommands } from "./handlers/commands";
import { getGlobalDocument } from "./database/global";
import { getLogger } from "./util/logger";
import { connection } from "./database";
import { inspect } from "util";
import fs from "fs";

const discordLogger = getLogger("discord");
const generalLogger = getLogger("general");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    presence: { status: "dnd", activities: [{ type: ActivityType.Watching, name: "загрузочный экран" }] },
});

client.once("ready", async () => {
    discordLogger.info(`Ready as ${client.user!.tag}.`);

    const commandsStart = Date.now();
    registerCommands(client).then(() => {
        discordLogger.info(`Refreshed commands (${Date.now() - commandsStart}ms).`);
    });

    const globalDocument = await getGlobalDocument();

    const ticketChannel = client.channels.cache.get("962402003366051870") as TextChannel;
    await ticketChannel.messages
        .fetch(globalDocument.ticketMessage)
        .then((m) =>
            m.edit({
                embeds: [
                    {
                        title: "Заявки",
                        description:
                            "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
                    },
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder()
                            .setLabel("Создать заявку")
                            .setCustomId("tickets:create")
                            .setStyle(ButtonStyle.Primary),
                    ]),
                ],
            }),
        )
        .catch(() =>
            ticketChannel
                .send({
                    embeds: [
                        {
                            title: "Заявки",
                            description:
                                "Чтобы попасть на сервер не тратив деньги, можно подать заявку, нажав на кнопку ниже.",
                        },
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents([
                            new ButtonBuilder()
                                .setLabel("Создать заявку")
                                .setCustomId("tickets:create")
                                .setStyle(ButtonStyle.Primary),
                        ]),
                    ],
                })
                .then((m) => {
                    globalDocument.ticketMessage = m.id;
                    globalDocument.safeSave();
                }),
        );

    updatePresence();
    setInterval(() => updatePresence(), 1000 * 60);
});

for (const file of fs.readdirSync(`${__dirname}/events`)) {
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0]!;
    client.on(eventName, event.run);
}

const updatePresence = () =>
    client.user!.setPresence({ status: "online", activities: [{ type: ActivityType.Watching, name: "#SoF 4?" }] });

client.on("rateLimit", (rateLimitInfo) => console.warn(`Rate limited.\n${JSON.stringify(rateLimitInfo)}`));
client.on("warn", (info) => console.warn(`Warning. ${info}`));

connection.then(() => client.login());

process.on("unhandledRejection", (e) => generalLogger.error(`unhandledRejection:\n${inspect(e, { depth: Infinity })}`));
process.on("uncaughtException", (e) => generalLogger.error(`uncaughtException:\n${inspect(e, { depth: Infinity })}`));
