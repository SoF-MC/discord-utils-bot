module.exports = {
    description: "привет :D",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 1, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 1
};

const config = require("../../config");
const mcUtil = require("minecraft-server-util");
const rcon = new mcUtil.RCON("play.soff.ml", { port: 25690, password: config.passwords.rcon.main });

module.exports.run = async (message, args) => {
    let nick = gldb.get().nicknames[args[0]];
    if (!nick) return message.react("❌");

    const m = await message.reply("Работаю...");

    rcon.on("output", async res => {
        await m.edit(m.content + `\nОтвет: ||${res}||\n**Это сообщение будет удалено через 30 секунд.**`).then(() => setTimeout(async () => {
            await message.delete();
            await m.delete();
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
        }).then(() => message.channel.edit({ name: "main-" + message.channel.name.split("-")[1] }).catch()).catch();
        rcon.close();
    });

    await rcon.connect().then(() => {
        m.edit(m.content + "\n✅ Запрос на добавление в вайтлист был отправлен.").catch();
        rcon.run("sync console bungee bungeewhitelist add " + nick);
    }).catch(err => {
        log.error(err);
    });
};