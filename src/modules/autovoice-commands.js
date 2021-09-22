const { Client } = require("discord.js"), { deleteMessage } = require("../handlers/utils");

module.exports = async (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");
    const manageChannel = guild.channels.cache.get("807466325533523970");

    const guildDB = await db.guild(guild.id);

    client.on("message", async (message) => {
        if (
            message.channel.id !== manageChannel.id ||
            message.author.bot
        ) return;

        const args = message.content.split(" "), validActions = ["add", "remove", "lock", "unlock", "limit", "name"];
        const memberChannelID = guildDB.get().privateVoices[message.author.id];
        const memberChannel = memberChannelID ? guild.channels.cache.get(memberChannelID) : null;

        if (
            !memberChannelID ||
            message.member.voice.channel !== memberChannel ||
            !validActions.includes(args[0])
        ) return deleteMessage(message);

        switch (args[0]) {
            case "add":
                let toAdd = message.mentions.users.first() ? message.mentions.users.first().id : args[1];
                if (!guild.members.cache.get(toAdd)) return deleteMessage(message);
                else toAdd = guild.members.cache.get(toAdd);

                return memberChannel.updateOverwrite(toAdd, {
                    "CONNECT": true,
                    "STREAM": true,
                    "SPEAK": true
                }).then(async () => {
                    await message.channel.send(`${message.author.toString()}, ${toAdd.toString()} был добавлен в ваш канал.`).then(m => setTimeout(() => {
                        deleteMessage(m);
                        deleteMessage(message);
                    }, 10000));
                });
            case "remove":
                let toRemove = message.mentions.users.first() ? message.mentions.users.first().id : args[1];
                if (!guild.members.cache.get(toRemove)) return deleteMessage(message);
                else toRemove = guild.members.cache.get(toRemove);

                return memberChannel.updateOverwrite(toRemove, {
                    "CONNECT": false,
                    "STREAM": false,
                    "SPEAK": false
                }).then(async () => {
                    await message.channel.send(`${message.author.toString()}, доступ в Ваш канал для пользователя ${toAdd.toString()} был убран.`).then(m => setTimeout(() => {
                        deleteMessage(m);
                        deleteMessage(message);
                    }, 10000));
                });
            case "lock":
                break;
            case "unlock":
                break;
            case "limit":
                break;
            case "name":
                break;
        };
    });
};