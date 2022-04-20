"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = require("@discordjs/builders");
const discord_html_transcripts_1 = require("discord-html-transcripts");
const pretty_ms_1 = __importDefault(require("pretty-ms"));
module.exports = {
    options: new builders_1.SlashCommandBuilder()
        .setName("exportchannel")
        .setDescription("Export channel's messages to a HTML file.")
        .addChannelOption(o => o
        .setName("channel")
        .setDescription("Channel to export.")
        .addChannelTypes([0, 5]))
        .toJSON(),
    permission: 5,
    run: async (interaction) => {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        await interaction.deferReply();
        const start = Date.now();
        const file = await (0, discord_html_transcripts_1.createTranscript)(channel, {
            limit: -1,
            fileName: `${channel.name.match(/а-яa-z/i)?.[0]}-${Date.now()}.html`
        });
        await interaction.editReply({
            content: `Exported \`${file.name}\` in ${(0, pretty_ms_1.default)(Date.now() - start)}.`,
            files: [file]
        });
    }
};
