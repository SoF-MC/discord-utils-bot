module.exports = {
    description: "Установить префикс бота на сервере.",
    usage: {
        "[префикс...]": "Новый префикс для бота. Оставьте пустым, если хотите сбросить."
    },
    examples: {
        "p?": "Изменить префикс на `p?`."
    },
    aliases: ["prefix"],
    permissionRequired: 1, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: () => true
};

const config = require("../../config");

module.exports.run = async (message, args, gdb) => {
    const content = args.length ? args.join(" ").replace(/"|'/g, "") : "";

    if (content.length > 6) return message.reply("❌ Максимальная длина префикса - 6 символов.");

    gdb.set("prefix", content);

    if (!content) return message.channel.send(`✅ Префикс был сброшен на \`${config.prefix}\``);
    else return message.channel.send(`✅ Префикс был изменён на \`${content}\``);
};