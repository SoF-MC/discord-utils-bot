"use strict";
const builders_1 = require("@discordjs/builders");
const utils_1 = require("../handlers/utils");
module.exports = {
    options: new builders_1.SlashCommandBuilder().toJSON(),
    permission: 2,
    run: async (message, args) => {
        const rcon = {};
        let nick = "";
        if (!nick)
            return message.react("❌");
        const m = await message.reply("Работаю...");
        rcon.on("output", async (res) => {
            await m.edit(m.content + `\nОтвет: ||${res}||\n**Это сообщение будет удалено через 30 секунд.**`).then(() => setTimeout(async () => {
                (0, utils_1.deleteMessage)(message);
                (0, utils_1.deleteMessage)(m);
            }, 30000));
            message.channel.send(`<@${args[0]}>,`, {
                embed: {
                    title: "Поздравляю! Вы прошли 2-й этап заявки.",
                    footer: {
                        icon_url: message.author.avatarURL({ dynamic: true, format: "png" }),
                        text: "Принял: " + message.author.tag
                    },
                    description: [
                        "Теперь Вы можете зайти на наш сервер используя данные ниже.",
                        "Есть вопросы? Можете смело их задать в этом канале."
                    ].join("\n"),
                    fields: [
                        {
                            name: "Айпи",
                            value: "**`play.soff.ml`**",
                            inline: true
                        },
                        {
                            name: "Версия",
                            value: "**`1.16.5`**",
                            inline: true,
                        }
                    ]
                }
            }).then(async () => {
                message.channel.edit({ name: "main-" + message.channel.name.split("-")[1] }).catch();
                let member = await message.guild.members.fetch(args[0]);
                await member.roles.remove([
                    "764180408056414289"
                ]).catch();
                await member.roles.add([
                    "764180192829767750",
                    "790834431849791508",
                    "791657594228965377",
                    "855498133508456507"
                ]).catch();
            }).catch();
            rcon.close();
        });
        await rcon.connect().then(() => {
            m.edit(m.content + "\n✅ Запрос на добавление в вайтлист был отправлен.").catch();
            rcon.run("addwl " + nick);
        }).catch(err => {
            console.error(err);
        });
    }
};
