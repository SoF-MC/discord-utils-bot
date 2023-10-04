import { GuildMember, TextChannel } from "discord.js";

export async function run(member: GuildMember) {
    if (member.guild.id !== "764178286233518100") return;

    const channel = member.guild.channels.cache.get("764179432147124304") as TextChannel;

    if (member.user.bot) {
        await member.roles.add([
            "764187012600954900", // Робот
            "784702019118039071", // Бот Рэально
        ]);
    } else {
        await member.roles.add([
            "790925095593443338", // spacer
            "764180408056414289", // Гость
        ]);
        await channel.send({
            content: `${member},`,
            embeds: [
                {
                    title: "Привет!",
                    description: `ъппъх! Ты присоединился к нам в гильдию. Теперь ты можешь пользоваться всеми приложениями на сервере.`,
                },
            ],
        });
    }
}
