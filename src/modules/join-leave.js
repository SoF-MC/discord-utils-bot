const { Client } = require("discord.js");

module.exports = (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");

    client.on("guildMemberAdd", (member) => {
        if (member.guild.id != guild.id) return;

        member.roles.add([
            "790925095593443338",       // spacer
            "764180408056414289"        // guest
        ], "Join autorole.").then(() => {
            guild.channels.cache.get("764179432147124304").send(`<@${member.user.id}>, сервер закрыт. Переходите сюда: discord.gg/C9RHqjA6ZS`);
        });
    });
};