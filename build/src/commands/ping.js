"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = require("@discordjs/builders");
const pretty_ms_1 = __importDefault(require("pretty-ms"));
module.exports = {
    options: new builders_1.SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get latency of the bot.")
        .toJSON(),
    permission: 0,
    run: async (interaction) => {
        const server = Date.now() - interaction.createdTimestamp;
        const uptime = (0, pretty_ms_1.default)(interaction.client.uptime);
        const api = interaction.guild.shard.ping;
        await interaction.reply({
            embeds: [{
                    title: "🏓 Понг!",
                    description: [
                        "```",
                        `Сервер   :: ${server}ms`,
                        `API      :: ${api}ms`,
                        `Аптайм   :: ${uptime}`,
                        "```"
                    ].join("\n")
                }]
        });
    }
};
