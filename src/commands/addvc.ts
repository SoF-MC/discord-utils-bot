import { SlashCommandBuilder } from "@discordjs/builders";
import { deleteMessage } from "../handlers/utils";
import { CommandInteraction, VoiceBasedChannel } from "discord.js";
import Util from "../util/Util";

export = {
    options: new SlashCommandBuilder()
        .setName("addvc")
        .setDescription("Добавить юзера в голосовй канал.")
        .addUserOption((o) => o.setName("user").setDescription("Юзер, которого нужно добавить в голосовой канал.").setRequired(true))
        .toJSON(),
    permissions: 2,
    run: async (interaction: CommandInteraction) => {
        interaction.reply({ fetchReply: true }).then((msg) => { })
        let nickname = "";
        let member = await interaction.guild.members.fetch(interaction.options.getUser("user"));
        if (!member) return interaction.reply({ content: "❌ Не удалось найти пользователя с этим ID.", ephemeral: true })/*.then(m => setTimeout(() => {
            deleteMessage(message);
            deleteMessage(m);
        }, 2000))*/.catch();

        const m = await interaction.reply("Работаю...");

        let newNick = member.user.username.substr(0, 26 - nickname.length).trim() + " | " + nickname;

        await member.setNickname(newNick).then(() => interaction.editReply("✅ Ник успешно установлен.").catch());

        // Util.database.global.setOnObject("nicknames", member.user.id, nickname); TODO
        await interaction.editReply(await interaction.fetchReply() + "\n✅ Ник пользователя успешно внесён в базу данных.").catch();
        interaction.channel.send({
            content: `${member},`,
            embeds: [{
                title: "Поздравляю! Вы прошли 1-й этап заявки.",
                footer: {
                    icon_url: interaction.user.avatarURL(),
                    text: "Принял: " + interaction.user.tag
                },
                description:
                    "Теперь Вам нужно подождать, пока Вас пригласят в голосовой канал и проведут личную беседу. " +
                    "Время ожидания до 24-х часов."
            }]
        }).then(() => {
            interaction.channel.edit({ name: "vc-" + interaction.channel.name.split("-")[1] });
            const vc = interaction.guild.channels.cache.get("896706646359830549") as VoiceBasedChannel;
            vc.permissionOverwrites.edit(interaction.options.getUser("user"), {
                ViewChannel: true,
                Connect: true
            });
        });
    }
};
