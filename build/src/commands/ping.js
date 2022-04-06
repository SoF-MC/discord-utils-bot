"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = require("@discordjs/builders");
const pretty_ms_1 = __importDefault(require("pretty-ms"));
const Util_1 = __importDefault(require("../util/Util"));
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
        let a = Date.now();
        await Util_1.default.mongoose.model("Global").find();
        const dbping = Date.now() - a;
        await interaction.reply({
            embeds: [{
                    title: "🏓 Понг!",
                    description: [
                        "```",
                        `Сервер   :: ${server}ms`,
                        `API      :: ${api}ms`,
                        `DB       :: ${dbping}ms`,
                        `Аптайм   :: ${uptime}`,
                        "```"
                    ].join("\n")
                }]
        });
    }
};
