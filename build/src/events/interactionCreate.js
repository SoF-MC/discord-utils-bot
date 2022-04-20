"use strict";
const buttons_1 = require("../handlers/buttons");
const commands_1 = require("../handlers/commands");
module.exports = async (interaction) => {
    if (interaction.isCommand())
        await (0, commands_1.processCommand)(interaction);
    if (interaction.isButton())
        await (0, buttons_1.processButton)(interaction);
};
