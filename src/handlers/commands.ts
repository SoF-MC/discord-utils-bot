import { Client, CommandInteraction, GuildMember } from "discord.js";

export const processCommand = async (interaction: CommandInteraction) => {
    const commandName = interaction.commandName;
    const commandFile = require(`../commands/${commandName}`) as SlashCommand;

    const user = Util.database.global.get().userdata.find(user => user.id === interaction.user.id);

    if ((user.permissions || 0) < commandFile.permission)
        return await interaction.reply({ content: "❌ Недостаточно прав.", ephemeral: true });

    try {
        await commandFile.run(interaction);
    } catch (e) {
        console.error(`Error in ${commandName}:`, e);
    };
};

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import config from "../../config";
import { SlashCommand } from "../../types";
import Util from "../util/Util";
const commands = [];
const rest = new REST({ version: "9" }).setToken(config.token);

export const registerCommands = async (client: Client) => {
    const files = fs.readdirSync(`${__dirname}/../commands/`);

    for (let filename of files) {
        let file = require(`../commands/${filename}`);

        file.options ? commands.push(file.options) : null;
    };

    return await rest.put(Routes.applicationGuildCommands(client.user.id, "764178286233518100"), { body: commands });
};