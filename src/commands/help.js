module.exports = {
    description: "Получить помощь в использовании бота / список команд.",
    usage: {
        "[запрос]": "Запрос для поиска. Например, команда."
    },
    examples: {
        "help": "Получить помощь по команде... Подождите, Вы это уже нашли :D"
    },
    aliases: ["commands"],
    permissionRequired: 0, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length <= 1
};

const fs = require("fs"), config = require("../../config");

module.exports.run = async (message, args, gdb, { prefix, permissionLevel }) => {
    if (!args[0]) return message.reply({
        embed: {
            title: `Помощь ${client.user.username}`,
            description: [
                `**\`•\`** Если Вам нужна помощь по команде, используйте \`${prefix}help <команда>\`.`
            ].join("\n"),
            color: config.color,
            timestamp: Date.now(),
            footer: {
                icon_url: message.author.displayAvatarURL(),
                text: `Запрос от ${message.author.tag}`
            },
            fields: [
                {
                    name: "Доступные команды",
                    value: commands.filter(({ permissionRequired }) => permissionRequired <= permissionLevel).map(({ command }) => `\`${command}\``).filter(c => c).join(", "),
                    inline: true
                }
            ]
        }
    });
    else {
        args = args[0].toLowerCase();
        let commandFile = commands.find(({ command, aliases }) => args == command || aliases.includes(args));
        if (!commandFile) commandFile = commands.find(({ description }) => description.toLowerCase().includes(args));
        if (!commandFile) return message.reply("❌ Не удалось найти команду по Вашему запросу.");

        return message.reply({
            embed: {
                title: `Помощь: ${commandFile.command}`,
                description: commandFile.description,
                color: config.color,
                timestamp: Date.now(),
                footer: {
                    icon_url: message.author.displayAvatarURL(),
                    text: `Запрос от ${message.author.tag}`
                },
                fields: [
                    {
                        name: "Использование",
                        value: Object.keys(commandFile.usage).length ? `\`${prefix}${commandFile.command}${Object.keys(commandFile.usage).map(a => ` ${a}`).join("")}\`${Object.keys(commandFile.usage).map(a => `\n• \`${a}\`: ${commandFile.usage[a]}`).join("")}` : null
                    },
                    {
                        name: "Примеры",
                        value: Object.keys(commandFile.examples).length ? Object.keys(commandFile.examples).map(ex => `• \`${prefix}${commandFile.command}${ex ? ` ${ex}` : ""}\`: ${commandFile.examples[ex]}`).join("\n") : null
                    },
                    {
                        name: "Уровень прав", // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
                        value: `${commandFile.permissionRequired}: ${["Все", "Помощники", "Владелец сервера", "Админы бота", "Владелец бота"][commandFile.permissionRequired]} ${permissionLevel >= commandFile.permissionRequired ? "✅" : "❌"}`,
                        inline: true
                    },
                    {
                        name: "Алиасы",
                        value: commandFile.aliases.length ? commandFile.aliases.map(a => `\`${a}\``).join(", ") : null,
                        inline: true
                    }
                ].filter(f => f.value)
            }
        });
    };
};

let commands = [], defaultCommand = {
    description: "Undocumented.",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 0
};

const loadCommandDescriptions = () => {
    commands = [];

    for (const static of require("./_static.json")) if (!static.hideFromHelp) commands.push(Object.assign({}, defaultCommand, {
        description: "Статическая команда.",
        aliases: static.triggers.slice(1),
        command: static.triggers[0]
    }));

    fs.readdir("./src/commands/", (err, files) => {
        if (err) return console.log(err);
        for (const file of files) if (file.endsWith(".js")) {
            const commandFile = Object.assign({}, require(`../commands/${file}`)), fileName = file.replace(".js", "");
            commandFile.command = fileName;
            if (config.isPremium || !commandFile.premiumOnly) commands.push(Object.assign({}, defaultCommand, commandFile));
        };
        commands = commands.sort((a, b) => a.command.localeCompare(b.command));
    });
};

loadCommandDescriptions();
module.exports.loadCommandDescriptions = loadCommandDescriptions;