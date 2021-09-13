module.exports = {
    description: "привет :D",
    usage: {
        "<ID>": "Айди пользователя."
    },
    examples: {},
    aliases: [],
    permissionRequired: 1, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 1
};

const config = require("../../config");
const mcUtil = require("minecraft-server-util");
const rcon = new mcUtil.RCON("play.soff.ml", { port: 25690, password: config.passwords.rcon.main });
const { deleteMessage } = require("../handlers/utils");

module.exports.run = async (message, args) => {
    let nick = gldb.get().nicknames[args[0]];
    if (!nick) return message.react("❌");

    const m = await message.reply("Работаю...");

    rcon.on("output", async res => {
        await m.edit(m.content + `\nОтвет: ||${res}||\n**Это сообщение будет удалено через 30 секунд.**`).then(() => setTimeout(async () => {
            deleteMessage(message);
            deleteMessage(m);
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
                "764180408056414289"        // guest
            ]).catch();
            await member.roles.add([
                "764180192829767750",       // member
                "790834431849791508",       // flex
                "791657594228965377",       // sof player
                "855498133508456507"        // nezayavki
            ]).catch();
        }).catch();

        rcon.close();
    });

    await rcon.connect().then(() => {
        m.edit(m.content + "\n✅ Запрос на добавление в вайтлист был отправлен.").catch();
        rcon.run("addwl " + nick);
    }).catch(err => {
        log.error(err);
    });
};