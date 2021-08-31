const config = require("../../config");

module.exports = Object.assign(
    require("./time")
);

module.exports.getPermissionLevel = member => {
    if (config.admins[0] === member.user.id) return 4; // bot owner
    if (config.admins.includes(member.user.id)) return 3; // bot admin
    if (member.guild.ownerID === member.id) return 2; // server owner
    if (member.roles.cache.has("830347550372134934")) return 1; // server admin
    return 0; // server member
};

module.exports.plurify = (number, word) => {
    const endsWith = (str, suffix) => {
        return String(str).match(suffix + "$") == suffix;
    };

    if (
        endsWith(number, 0) ||
        endsWith(number, 5) ||
        endsWith(number, 6) ||
        endsWith(number, 7) ||
        endsWith(number, 8) ||
        endsWith(number, 9)
    ) return `${number} ${word}ов`;
    else if (endsWith(number, 1)) return `${number} ${word}`;
    else if (
        endsWith(number, 2) ||
        endsWith(number, 3) ||
        endsWith(number, 4)
    ) return `${number} ${word}а`;
};