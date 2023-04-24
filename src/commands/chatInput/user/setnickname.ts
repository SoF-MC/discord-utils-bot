import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import { getUserDocument } from "../../../database/user";

export default {
    name: "setnickname",
    description: "дать имя",
    options: [{
        name: "user",
        description: "пользователь",
        type: ApplicationCommandOptionType.User,
        required: true
    }, {
        name: "nickname",
        description: "да",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    execute: async (interaction) => {
        const user = interaction.options.getUser("user", true);
        const nickname = interaction.options.getString("nickname", true);

        const document = await getUserDocument(user.id);

        document.nickname = nickname;
        await document.save();

        return void interaction.reply({
            content: `✅ Имя пользователя ${user} изменено на ${nickname}`,
            allowedMentions: { parse: [] }
        });
    }
} satisfies ChatInputCommand;