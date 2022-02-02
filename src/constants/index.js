const config = require("../../config");

module.exports.getPermissionLevel = member => {
    if (config.admins[0] === member.user.id) return 4; // bot owner
    if (config.admins.includes(member.user.id)) return 3; // bot admin
    if (member.guild.ownerID === member.id) return 2; // server owner
    if (member.roles.cache.has("830347550372134934")) return 1; // server admin
    return 0; // server member
};