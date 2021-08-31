module.exports = {
    description: "Get the latency of the bot.",
    usage: {},
    examples: {},
    aliases: ["pong", "latency"],
    permissionRequired: 0, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => !args.length
};

module.exports.run = async (message) => {
    const m = await message.reply("〽️ Собираю информацию...");

    return m.edit("", {
        embed: {
            title: "🏓 Понг!",
            fields: [
                {
                    name: "Сервер",
                    value: `\`${m.createdTimestamp - message.createdTimestamp}ms\``
                },
                {
                    name: "API",
                    value: `\`${Math.round(client.ws.ping)}ms\``
                },
                {
                    name: "Аптайм",
                    value: `\`${msToTime(client.uptime)}\``
                }
            ]
        }
    });
};