import { ApplicationCommandOptionType } from "discord.js";
import type { SecondLevelChatInputCommand } from "..";
import { getUserDocument } from "../../../database/user";
import AccountHandler from "../../../handlers/AccountHandler";

export default {
    name: "register",
    description: "регистрация",
    options: [{
        name: "password",
        description: "пароль",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    execute: async (interaction) => {
        const password = interaction.options.getString("password", true);
        await interaction.deferReply({ ephemeral: true });

        const document = await getUserDocument(interaction.user.id);

        if (document.registered) {
            return void interaction.editReply("❌ Вы уже зарегистрированы");
        };
        if (document.nickname === "") {
            return void interaction.editReply("❌ Вы ещё не подали заявку");
        };

        const handler = new AccountHandler(interaction.client, document.nickname);
        const res = await handler.register(password);

        if (!res) {
            return void interaction.editReply("❌ Произошла ошибка");
        };

        document.registered = true;
        await document.save();

        return void interaction.editReply({
            embeds: [{
                title: "✅ Успешно",
                fields: [{
                    name: "Логин",
                    value: document.nickname
                }, {
                    name: "Пароль",
                    value: `||${password}||`
                }]
            }]
        });
    }
} satisfies SecondLevelChatInputCommand;