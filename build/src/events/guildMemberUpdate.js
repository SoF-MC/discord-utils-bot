"use strict";
module.exports = async (oldMember, newMember) => {
    if (!oldMember.roles.cache.has("764180192829767750") &&
        newMember.roles.cache.has("764180192829767750"))
        await newMember.roles.remove("764180408056414289").catch(() => null);
};
