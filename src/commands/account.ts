import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, Message, TextChannel } from "discord.js";
import UserData from "../database/models/UserData";

export = {
    options: new SlashCommandBuilder()
        .setName("account")
        .setDescription(".")
        .addSubcommand((c) =>
            c.setName("password").setDescription("Сменить пароль аккаунта.").addStringOption((o) =>
                o.setName("password").setDescription("Новый пароль.").setRequired(true).setMinLength(6).setMaxLength(16)
            )
        )
        .toJSON(),
    permission: 0,
    run: async (interaction: ChatInputCommandInteraction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "password") {
            const channel = interaction.guild.channels.cache.get("1033704247063224392") as TextChannel;
            const user = await UserData.findOne({ user: interaction.user.id });
            const password = interaction.options.getString("password");

            if (!user.nickname) return void interaction.reply({ content: "Ваш тикет ещё не был принят.", ephemeral: true })
                .then(() => setTimeout(() => interaction.deferReply().catch(() => null), 1000 * 10));

            // const filter = (msg: Message) => msg.author.id === interaction.client.user.id && !msg.content.startsWith("l!");

            if (!user.registered) {
                await channel.send(`l!config auth.std.core register ${user.nickname} email@example.com ${password}`);
                // const reply = (await channel.awaitMessages({ filter, time: 1000 * 1, max: 1 })).first();

                await interaction.reply({
                    embeds: [{
                        title: "Аккаунт создан",
                        fields: [{
                            name: "Логин",
                            value: `\`${user.nickname}\``
                        }, {
                            name: "Пароль",
                            value: `||\`${password}\`||`
                        }]
                    }],
                    ephemeral: true
                });

                await user.updateOne({ $set: { registered: true } });
            } else {
                await channel.send(`l!config auth.std.core changePassword ${user.nickname} ${password}`);
                // const reply = (await channel.awaitMessages({ filter, time: 1000 * 1, max: 1 })).first();

                await interaction.reply({
                    embeds: [{
                        title: "Пароль изменён",
                        fields: [{
                            name: "Логин",
                            value: `\`${user.nickname}\``
                        }, {
                            name: "Новый пароль",
                            value: `||\`${password}\`||`
                        }]
                    }],
                    ephemeral: true
                });
            };
        };
    }
};