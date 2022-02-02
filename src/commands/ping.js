const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction } = require("discord.js");

module.exports = {
    options: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get latency of the bot.")
        .toJSON(),
    permission: 0
};

const prettyms = require("pretty-ms");

module.exports.run = async (interaction) => {
    if (!(interaction instanceof CommandInteraction)) return;

    await interaction.deferReply();

    const uptime = prettyms(interaction.client.uptime);
    const api = Math.ceil(interaction.guild.shard.ping);

    return await interaction.editReply({
        embeds: [{
            title: "🏓 Понг!",
            fields: [{
                name: "Сервер",
                value: `\`${Date.now() - interaction.createdTimestamp}ms\``
            }, {
                name: "API",
                value: `\`${api}ms\``
            }, {
                name: "Аптайм",
                value: `\`${uptime}\``
            }]
        }]
    });
};