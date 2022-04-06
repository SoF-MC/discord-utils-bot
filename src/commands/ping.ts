import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import prettyms from "pretty-ms";
import Util from "../util/Util";

export = {
    options: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get latency of the bot.")
        .toJSON(),
    permission: 0,
    run: async (interaction: CommandInteraction): Promise<void> => {
        const server = Date.now() - interaction.createdTimestamp;
        const uptime = prettyms(interaction.client.uptime);
        const api = interaction.guild.shard.ping;

        let a = Date.now();
        await Util.mongoose.model("Global").find();
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