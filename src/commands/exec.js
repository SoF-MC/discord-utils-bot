const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    options: new SlashCommandBuilder()
        .setName("exec")
        .setDescription("Execute bash script.")
        .addStringOption((option) => option.setName("script").setDescription("Bash script that'd be ran.").setRequired(true))
        .toJSON(),
    permission: 4
};

const { exec } = require("child_process");
const { CommandInteraction } = require("discord.js");

module.exports.run = async (interaction) => {
    if (!(interaction instanceof CommandInteraction)) return;

    await interaction.deferReply();

    exec(interaction.options.getString("script"), async (error, stdout) => {
        return await interaction.editReply(`\`\`\`${(error || stdout).slice(0, 1994)}\`\`\``);
    });
};