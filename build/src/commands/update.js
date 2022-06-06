"use strict";
const builders_1 = require("@discordjs/builders");
const child_process_1 = require("child_process");
module.exports = {
    options: new builders_1.SlashCommandBuilder()
        .setName("update")
        .setDescription("Update the bot.")
        .toJSON(),
    permission: 5,
    run: async (interaction) => {
        await interaction.deferReply();
        (0, child_process_1.exec)("git pull", async (err, stdout, stderr) => {
            if (err)
                return console.error(err);
            const str = stdout || stderr;
            if (str.includes("Already up to date."))
                return await interaction.editReply("Already up-to-date.");
            await interaction.editReply("```\n" + (stdout || stderr).substring(0, 1992) + "\n```");
            process.exit(0);
        });
    }
};
