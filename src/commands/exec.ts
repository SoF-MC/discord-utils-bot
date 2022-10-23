import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { exec } from "child_process";

export = {
    options: new SlashCommandBuilder()
        .setName("exec")
        .setDescription("Execute bash script.")
        .addStringOption((option) => option.setName("script").setDescription("Bash script that'd be ran.").setRequired(true))
        .toJSON(),
    permission: 5,
    run: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();

        exec(interaction.options.getString("script"), async (error, stdout) => {
            await interaction.editReply(`\`\`\`${(error || stdout).toString().slice(0, 1994)}\`\`\``);
        });
    }
};