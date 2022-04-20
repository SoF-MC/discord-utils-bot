"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.processCommand = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../../config"));
const Util_1 = __importDefault(require("../util/Util"));
const commands = [];
const rest = new rest_1.REST({ version: "9" }).setToken(config_1.default.token);
const processCommand = async (interaction) => {
    const commandName = interaction.commandName;
    const commandFile = require(`../commands/${commandName}`);
    const user = (await Util_1.default.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON();
    if ((user.permissions || 0) < commandFile.permission)
        return await interaction.reply({ content: "❌ Недостаточно прав.", ephemeral: true });
    try {
        await commandFile.run(interaction);
    }
    catch (e) {
        console.error(`Error in ${commandName}:`, e);
    }
    ;
};
exports.processCommand = processCommand;
const registerCommands = async (client) => {
    const files = fs_1.default.readdirSync(`${__dirname}/../commands/`);
    for (let filename of files) {
        let file = require(`../commands/${filename}`);
        file.options ? commands.push(file.options) : null;
    }
    ;
    return await rest.put(v9_1.Routes.applicationGuildCommands(client.user.id, "764178286233518100"), { body: commands });
};
exports.registerCommands = registerCommands;
