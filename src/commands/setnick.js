module.exports = {
    description: "привет :D",
    usage: {},
    examples: {},
    aliases: ["sn"],
    permissionRequired: 4, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 2 || (args.length == 3 && args[2] === "-nn")
};

module.exports.run = async (message, args) => {
    let nickname = args[1];
    let member = await message.guild.members.fetch(args[0]).catch(async () => {
        message.reply("❌ Не удалось найти пользователя с этим ID.").then(m => setTimeout(() => {
            message.delete();
            m.delete();
        }, 2000));
    });

    let newNick = member.user.username.substr(0, 26 - nickname.length).trim() + " | " + nickname;

    await gldb.setOnObject("nicknames", args[0], args[1]);
    if (args.length !== 3 && args[2] !== "-nn") await member.setNickname(newNick);
    await message.react("✅");
};