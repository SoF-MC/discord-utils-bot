const { CommandInteraction } = require("discord.js");
const { getPermissionLevel } = require("../constants/");

module.exports = async (interaction) => {
    if (!(interaction instanceof CommandInteraction)) return;

    const commandName = interaction.commandName;

    const commandFile = require(`../commands/${commandName}.js`);

    if (getPermissionLevel(interaction.member) < commandFile.permissionRequired) {
        return await interaction.reply({ content: "❌ Недостаточно прав.", ephemeral: true });
    };

    return await commandFile.run(interaction);
};

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const commands = [];
const rest = new REST({ version: "9" }).setToken(require("../../config").token);

module.exports.registerCommands = async (client) => {
    const files = fs.readdirSync(__dirname + "/../commands/");

    for (let filename of files) {
        let file = require(`../commands/${filename}`);
        const name = file.name || "";

        if (file.slash && name.length) {
            commands.push({
                name: name,
                description: file.description || "none",
                options: file.opts || null,
            });
        };
    };

    return await rest.put(Routes.applicationGuildCommands(client.user.id, ""), { body: commands });
};