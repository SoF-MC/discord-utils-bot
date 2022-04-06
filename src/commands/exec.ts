import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { exec } from "child_process";

export = {
    options: new SlashCommandBuilder()
        .setName("exec")
        .setDescription("Execute bash script.")
        .addStringOption((option) => option.setName("script").setDescription("Bash script that'd be ran.").setRequired(true))
        .toJSON(),
    permission: 5,
    run: async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        exec(interaction.options.get("script").value as string, async (error, stdout) => {
            await interaction.editReply(`\`\`\`${(error || stdout).toString().slice(0, 1994)}\`\`\``);
        });
    }
};