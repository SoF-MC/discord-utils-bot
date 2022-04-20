import { SlashCommandBuilder } from "@discordjs/builders";
import { createTranscript } from "discord-html-transcripts";
import { CommandInteraction, GuildTextBasedChannel, MessageAttachment } from "discord.js";
import prettyms from "pretty-ms";
import Util from "../util/Util";

export = {
    options: new SlashCommandBuilder()
        .setName("exportchannel")
        .setDescription("Export channel's messages to a HTML file.")
        .addChannelOption(o =>
            o
                .setName("channel")
                .setDescription("Channel to export.")
                .addChannelTypes([0, 5])
        )
        .toJSON(),
    permission: 5,
    run: async (interaction: CommandInteraction): Promise<void> => {
        const channel: GuildTextBasedChannel = interaction.options.getChannel("channel") as any || interaction.channel;
        await interaction.deferReply();

        const start = Date.now();
        const file = await createTranscript(channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `${channel.name}-${Date.now()}.html`
        }) as MessageAttachment;

        await interaction.editReply({
            content: `Exported \`${file.name}\` in ${prettyms(Date.now() - start)}.`,
            files: [file]
        })
    }
};