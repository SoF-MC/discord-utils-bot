import axios from "axios";
import { ApplicationCommandOptionType } from "discord.js";
import fs from "node:fs/promises";
import type { ChatInputCommand } from "..";
import { getUserDocument } from "../../../database/user";

export default {
    name: "setskin",
    description: "поставить плащ",
    public: true,
    options: [{
        name: "skin",
        description: "плащ",
        type: ApplicationCommandOptionType.Attachment,
        required: true
    }],
    execute: async (interaction) => {
        const skin = interaction.options.getAttachment("skin", true);

        if (!skin.name.endsWith(".png")) {
            return void interaction.reply("❌ Скин должен быть в формате png");
        };

        if (skin.width !== 64 || skin.height !== 64) {
            return void interaction.reply("❌ Скин должен быть 64x64");
        };

        await interaction.deferReply();

        const document = await getUserDocument(interaction.user.id);
        if (document.nickname === "") {
            return void interaction.editReply("❌ Вы ещё не подали заявку");
        };

        await fs.stat(`./playerdata/${document.nickname}`).catch(() => fs.mkdir(`./playerdata/${document.nickname}`));

        const res = await axios.get(skin.url, { responseType: "arraybuffer" });

        await fs.writeFile(`./playerdata/${document.nickname}/skin.png`, res.data);

        return void interaction.editReply({
            content: "✅ Скин успешно установлен"
        });
    }
} satisfies ChatInputCommand;