import { GuildMember } from "discord.js";

export = async (oldMember: GuildMember, newMember: GuildMember) => {
    if (
        !oldMember.roles.cache.has("764180192829767750") &&
        newMember.roles.cache.has("764180192829767750")
    ) await newMember.roles.remove("764180408056414289").catch(() => null);
};