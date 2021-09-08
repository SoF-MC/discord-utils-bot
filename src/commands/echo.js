module.exports = {
    description: "echo lol",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 1,
    checkArgs: (args) => !!args.length
};

const { deleteMessage } = require("../handlers/utils");

module.exports.run = async (message, args) => {
    message.channel.send(args.join(" "));
    deleteMessage(message);
};