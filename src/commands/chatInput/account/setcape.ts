import axios from "axios";
import { ApplicationCommandOptionType } from "discord.js";
import fs from "node:fs/promises";
import type { ChatInputCommand } from "..";
import { getUserDocument } from "../../../database/user";

export default {
    name: "setcape",
    description: "поставить плащ",
    public: true,
    options: [{
        name: "cape",
        description: "плащ",
        type: ApplicationCommandOptionType.Attachment,
        required: true
    }],
    execute: async (interaction) => {
        const cape = interaction.options.getAttachment("cape", true);

        if (!cape.name.endsWith(".png")) {
            return void interaction.reply("❌ Плащ должен быть в формате png");
        };

        if (cape.width !== 64 || cape.height !== 32) {
            return void interaction.reply("❌ Плащ должен быть 64x32");
        };

        await interaction.deferReply();

        const document = await getUserDocument(interaction.user.id);
        if (document.nickname === "") {
            return void interaction.editReply("❌ Вы ещё не подали заявку");
        };

        await fs.stat(`./playerdata/${document.nickname}`).catch(() => fs.mkdir(`./playerdata/${document.nickname}`));

        const res = await axios.get(cape.url, { responseType: "arraybuffer" });

        await fs.writeFile(`./playerdata/${document.nickname}/cape.png`, res.data);

        return void interaction.editReply({
            content: "✅ Плащ успешно установлен"
        });
    }
} satisfies ChatInputCommand;