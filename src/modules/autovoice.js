const { Client } = require("discord.js");

module.exports = async (client = new Client) => {
    const guild = client.guilds.cache.get("764178286233518100");
    const createChannel = client.channels.cache.get("782603037948641302");

    const guildDB = await db.guild(guild.id);

    client.on("voiceStateUpdate", async (oldMember, newMember) => {
        if (
            oldMember.channelID == newMember.channelID
        ) return;

        if (
            !guildDB.get().privateVoices[newMember.member.user.id] &&
            newMember.channelID == createChannel.id
        ) {
            const newChannel = await guild.channels.create("Канал " + newMember.member.user.tag.match(/[a-zа-яёії0-9# ]/gi).join("").trim(), {
                type: "voice",
                parent: "791184368857120819",
                permissionOverwrites: [
                    {
                        id: newMember.member.user.id,
                        allow: ["CONNECT", "SPEAK", "PRIORITY_SPEAKER", "STREAM"]
                    },
                    {
                        id: "764420934991478784",
                        deny: ["SPEAK", "STREAM"]
                    },
                ]
            });

            await guildDB.setOnObject("privateVoices", newMember.member.user.id, newChannel.id);

            return newMember.setChannel(newChannel.id);
        } else if (
            !!guildDB.get().privateVoices[newMember.member.user.id] &&
            oldMember.channelID == guildDB.get().privateVoices[newMember.member.user.id]
        ) {
            await guild.channels.cache.get(guildDB.get().privateVoices[oldMember.member.user.id]).delete();
            return guildDB.removeFromObject("privateVoices", oldMember.member.user.id);
        };
    });
};