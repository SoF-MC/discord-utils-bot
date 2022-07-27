"use strict";
const builders_1 = require("@discordjs/builders");
const child_process_1 = require("child_process");
module.exports = {
    options: new builders_1.SlashCommandBuilder()
        .setName("exec")
        .setDescription("Execute bash script.")
        .addStringOption((option) => option.setName("script").setDescription("Bash script that'd be ran.").setRequired(true))
        .toJSON(),
    permission: 5,
    run: async (interaction) => {
        await interaction.deferReply();
        (0, child_process_1.exec)(interaction.options.get("script").value, async (error, stdout) => {
            await interaction.editReply(`\`\`\`${(error || stdout).toString().slice(0, 1994)}\`\`\``);
        });
    }
};
