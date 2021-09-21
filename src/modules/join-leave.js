const { Client } = require("discord.js");

module.exports = (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");

    client.on("guildMemberAdd", (member) => {
        if (member.guild.id !== guild.id) return;

        member.roles.add([
            "790925095593443338",       // spacer
            "764180408056414289"        // guest
        ], "Join autorole.").then(() => {
            guild.channels.cache.get("764179432147124304").send(`<@${member.user.id}>,`, {
                embed: {
                    footer: {
                        icon_url: member.user.displayAvatarURL({ dynamic: true }),
                        text: `${member.user.tag} - ${member.user.id}`
                    },
                    description: [
                        `> Приветствую на нашем сервере, **${member.user.tag}**`,
                        "Чтобы подать заявку на наш сервер, нажмите [сюда](https://canary.discord.com/channels/764178286233518100/870341851989819393)",
                        "Хотите получить доступ без ожиданий? Вы можете купить проходку за 100 рублей. Реквизиты есть [здесь](https://wiki.soff.ml/1%29%20%D0%9E%D1%81%D0%BD%D0%BE%D0%B2%D0%BD%D0%BE%D0%B5/2/). **Заметка: в описании напишите свой ник, что бы избежать проблем.**",
                        "\n**If you are not Russian, please read** <#859111866496581672>"
                    ].join("\n")
                }
            });
        });
    });
};
