import { ChatInputCommandInteraction, Client } from "discord.js";
import { SlashCommand, UserData } from "../../types";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import config from "../../config";
import Util from "../util/Util";
import fs from "fs";

export const processCommand = async (interaction: ChatInputCommandInteraction) => {
    const commandName = interaction.commandName;
    const commandFile = require(`../commands/${commandName}`) as SlashCommand;

    const user = (await Util.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON() as any as UserData;

    if ((user.permissions ?? 0) < (commandFile.permission ?? 0))
        return await interaction.reply({ content: "❌ Недостаточно прав.", ephemeral: true });

    try {
        await commandFile.run(interaction);
    } catch (e) {
        console.error(`Error in ${commandName}:`, e);
    };
};

const rest = new REST({ version: "9" }).setToken(config.token);
const commands = [];

export const registerCommands = async (client: Client) => {
    const files = fs.readdirSync(`${__dirname}/../commands/`);

    for (let filename of files) {
        let file = require(`../commands/${filename}`);
        file.options ? commands.push(file.options) : null;
    };

    return await rest.put(Routes.applicationGuildCommands(client.user.id, "764178286233518100"), { body: commands });
};