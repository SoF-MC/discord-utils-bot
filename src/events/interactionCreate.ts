import type { Interaction } from "discord.js";
import { processButton } from "../handlers/buttons";
import { processCommand } from "../handlers/commands";

export async function run(interaction: Interaction<"cached">) {
    if (interaction.guildId !== "764178286233518100") return;

    if (interaction.isChatInputCommand()) await processCommand(interaction);
    if (interaction.isButton()) await processButton(interaction);
}
