const
    { getPermissionLevel } = require("../constants/"),
    { loadCommandDescriptions } = require("../commands/help"),
    fs = require("fs"),
    { Message } = require("discord.js");

module.exports = async (message = new Message, prefix = String, gdb, db) => {
    let content;
    if (message.content.match(`^<@!?${client.user.id}> `)) content = message.content.split(" ").slice(1);
    else content = message.content.slice(prefix.length).split(" ");
    const commandOrAlias = content.shift().toLowerCase(), commandName = aliases.get(commandOrAlias) || commandOrAlias;
    content = content.join(" ");

    const static = statics.find(s => s.triggers.includes(commandName));
    if (!static && !commands.has(commandName)) return;

    const processCommand = async () => {
        log.log(`**${message.author.tag.replace("*", "\*")}** used the \`${commandName}\` command (\`${message.guild.name}\` - \`${message.channel.name}\`)`);

        if (static) return message.channel.send(static.message.replace(/{{INVITE}}/g, await client.generateInvite({ permissions: 19529 })));

        const commandFile = commands.get(commandName);

        const permissionLevel = getPermissionLevel(message.member);
        if (permissionLevel < commandFile.permissionRequired) return message.channel.send("❌ Недостаточно прав.");

        const args = (content.match(/"[^"]+"|[^ ]+/g) || []).map(arg => /*arg.startsWith("\"") && arg.endsWith("\"") ? arg.slice(1).slice(0, -1) : */arg);
        if (!commandFile.checkArgs(args)) return message.channel.send(`❌ Неверные аргументы. Для помощи, напишите \`${prefix}help ${commandName}\`.`);

        return commandFile.run(message, args, gdb, { prefix, permissionLevel, db })
            .catch(async (e) => {
                log.error(`An error occured while executing ${commandName}: ${e.stack}`);
                const m = await message.reply("❌ Произошла ошибка при исполнении команды. Сообщите разработчику.");

                let additionalInfo;
                if (e.stack.includes("DiscordAPIError: Missing"))
                    additionalInfo = "Изучив логи, удалось узнать, что Боту не хватило прав для удачного выполнения команды.";

                if (additionalInfo) m.edit(m.content + "\n" + additionalInfo);
            });
    };
    await processCommand();
};

// loading commands
const commands = new Map(), aliases = new Map(), statics = require("../commands/_static.json");

fs.readdir("./src/commands/", (err, files) => {
    if (err) return log.error(err);
    for (const file of files) if (file.endsWith(".js")) loadCommand(file.replace(".js", ""));
});

const loadCommand = fileName => {
    const commandFile = require(`../commands/${fileName}.js`);

    commands.set(fileName, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
};

module.exports.reloadCommand = command => {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
    loadCommand(command);
    loadCommandDescriptions();
};

module.exports.reloadStaticCommands = () => {
    delete require.cache[require.resolve("../commands/_static.json")];
    const newStatics = require("../commands/_static.json");
    statics.length = 0; // remove everything from the variable
    statics.push(...newStatics); // add new data to same variable
    loadCommandDescriptions();
};