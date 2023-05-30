import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import ms from "ms";

export = {
    options: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get latency of the bot.")
        .toJSON(),
    permission: 0,
    run: async (interaction: ChatInputCommandInteraction<"cached">) => {
        const server = Date.now() - interaction.createdTimestamp;
        const uptime = ms(interaction.client.uptime);
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