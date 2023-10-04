import { SlashCommandBuilder } from "@discordjs/builders";
import { createTranscript } from "discord-html-transcripts";
import type { ChatInputCommandInteraction, GuildTextBasedChannel } from "discord.js";
import ms from "ms";

export = {
    options: new SlashCommandBuilder()
        .setName("exportchannel")
        .setDescription("Export channel's messages to a HTML file.")
        .addChannelOption((o) => o.setName("channel").setDescription("Channel to export.").addChannelTypes(0, 5))
        .addIntegerOption((o) =>
            o.setName("limit").setDescription("Limit the number of messages to export.").setMinValue(1),
        )
        .toJSON(),
    permission: 5,
    run: async (interaction: ChatInputCommandInteraction<"cached">) => {
        if (interaction.guildId !== "764178286233518100")
            return interaction.reply({
                embeds: [
                    {
                        description: "Ало, ты не на софе 🗣️",
                    },
                ],
            });

        const channel: GuildTextBasedChannel =
            (interaction.options.getChannel("channel") as any) || interaction.channel;
        await interaction.deferReply();

        const start = Date.now();
        const file = await createTranscript(channel, {
            limit: interaction.options.getInteger("limit") ?? 100,
            filename: `${channel.name}-${Date.now()}.html`,
        });

        return await interaction.editReply({
            content: `Exported \`${file.name}\` in ${ms(Date.now() - start)}.`,
            files: [file],
        });
    },
};
