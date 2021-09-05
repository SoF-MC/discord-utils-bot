const { Client } = require("discord.js");
const { deleteMessage } = require("../handlers/utils");

module.exports = async (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");
    const manageChannel = guild.channels.cache.get("807466325533523970");

    const guildDB = await db.guild(guild.id);

    client.on("message", async (message) => {
        if (message.channel.id !== manageChannel.id) return;

        const args = message.content.split(" "), validActions = ["add", "remove", "lock", "unlock", "limit", "name"];

        if (!guildDB.get().privateVoices[message.author.id] || !validActions.includes(args[0])) return deleteMessage(message);

        return deleteMessage(message);
    });
};