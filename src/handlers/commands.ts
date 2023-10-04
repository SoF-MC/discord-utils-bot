import type { ChatInputCommandInteraction, Client } from "discord.js";
import { getUserDocument } from "../database";
import fs from "fs";

export const processCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const commandName = interaction.commandName;
    const commandFile = require(`../commands/${commandName}`);

    const user = await getUserDocument(interaction.user.id);

    if (user.permissions < (commandFile.permission ?? 0))
        return await interaction.reply({ content: "❌ Недостаточно прав.", ephemeral: true });

    try {
        return await commandFile.run(interaction);
    } catch (e) {
        console.error(`Error in ${commandName}:`, e);
    }
};

const commands: any[] = [];
export const registerCommands = async (client: Client<true>) => {
    const files = fs.readdirSync(`${__dirname}/../commands/`).filter((file) => file.endsWith(".js"));

    for (let filename of files) {
        let file = require(`../commands/${filename}`);
        file.options ? commands.push(file.options) : null;
    }

    return client.guilds.cache.get("764178286233518100")?.commands.set(commands);
};
