"use strict";
const buttons_1 = require("../handlers/buttons");
module.exports = async (interaction) => {
    if (interaction.isButton())
        await (0, buttons_1.processButton)(interaction);
};
