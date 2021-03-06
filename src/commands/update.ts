import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { exec } from "child_process";

export = {
    options: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Update the bot.")
        .toJSON(),
    permission: 5,
    run: async (interaction: CommandInteraction): Promise<void> => {
        await interaction.deferReply();
        exec("git pull", async (err, stdout, stderr) => {
            if (err) return console.error(err);
            const str = stdout || stderr;

            if (str.includes("Already up to date.")) return await interaction.editReply("Already up-to-date.");

            await interaction.editReply("```\n" + (stdout || stderr).substring(0, 1992) + "\n```");

            process.exit(0);
        });
    }
};