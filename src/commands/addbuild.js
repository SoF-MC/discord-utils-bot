module.exports = {
    description: "привет :D",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 1, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 2
};

const config = require("../../config");
const mcUtil = require("minecraft-server-util");
const rcon = new mcUtil.RCON("play.soff.ml", { port: 25598, password: config.passwords.rcon.build });
const { deleteMessage } = require("../handlers/utils");

module.exports.run = async (message, args) => {
    let nickname = args[0];
    let member = await message.guild.members.fetch(args[1]).catch(async () => {
        return message.reply("❌ Не удалось найти пользователя с этим ID.").then(m => setTimeout(() => {
            deleteMessage(message);
            deleteMessage(m);
        }, 2000)).catch();
    });
    const m = await message.reply("Работаю...");

    rcon.on("output", async res => {
        await m.edit(m.content + `\nОтвет: ||${res}||\n**Это сообщение будет удалено через 30 секунд.**`).then(() => setTimeout(async () => {
            deleteMessage(message);
            deleteMessage(m);
        }, 30000));
        message.channel.send(member.user.toString(), {
            embed: {
                title: "Поздравляю! Вы прошли 1-й этап заявки.",
                footer: {
                    icon_url: message.author.avatarURL({ dynamic: true, format: "png" }),
                    text: "Принял: " + message.author.tag
                },
                description: [
                    "Теперь зайдите на сервере по данным ниже, нажмите на табличку в центре (\"Билд\"), используйте команду `/p auto` и постарайтесь построить максимально красивую постройку.",
                    "Территория должна быть оформлена и использована по максимуму."
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
        }).then(() => message.channel.edit({ name: "build-" + message.channel.name.split("-")[1] }).catch()).catch();
        rcon.close();
    });

    let newNick = member.user.username.substr(0, 26 - nickname.length).trim() + " | " + nickname;

    await member.setNickname(newNick).then(() => m.edit("✅ Ник успешно установлен.").catch());

    await gldb.setOnObject("nicknames", member.user.id, nickname);
    await m.edit(m.content + "\n✅ Ник пользователя успешно внесён в базу данных.").catch();

    await rcon.connect().then(() => {
        m.edit(m.content + "\n✅ Запрос на добавление в вайтлист был отправлен.").catch();
        rcon.run("easywhitelist add " + nickname);
    }).catch(err => {
        log.error(err);
    });
};
