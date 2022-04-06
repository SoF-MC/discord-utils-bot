"use strict";
const commands_1 = require("../handlers/commands");
module.exports = async (interaction) => {
    if (interaction.isCommand())
        await (0, commands_1.processCommand)(interaction);
};
