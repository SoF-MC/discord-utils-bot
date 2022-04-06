import { Interaction } from "discord.js";
import { processCommand } from "../handlers/commands";

export = async (interaction: Interaction) => {
    if (interaction.isCommand()) await processCommand(interaction);
};