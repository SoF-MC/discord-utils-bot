const { Client, GuildMember } = require("discord.js");

module.exports = (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");

    client.on("guildMemberAdd", async (member = new GuildMember) => {
        if (member.guild.id !== guild.id) return;

        member.roles.add([
            "790925095593443338",       // spacer
            "764180408056414289"        // guest
        ], "Join autorole.").then(() => {
            guild.channels.cache.get("764179432147124304").send(`<@${member.user.id}>,`, {
                embed: {
                    title: "Привет!",
                    footer: {
                        icon_url: member.user.displayAvatarURL({ dynamic: true }),
                        text: `${member.user.tag} - ${member.user.id}`
                    },
                    description: [

                    ].join("\n")
                }
            });
        });
    });
};