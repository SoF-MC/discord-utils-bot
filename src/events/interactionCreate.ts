import { Interaction } from "discord.js";
import { processButton } from "../handlers/buttons";
import { processCommand } from "../handlers/commands";

export = async (interaction: Interaction) => {
    if (interaction.isCommand()) await processCommand(interaction);
    if (interaction.isButton()) await processButton(interaction);
};