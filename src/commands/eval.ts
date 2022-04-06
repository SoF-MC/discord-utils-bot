import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export = {
	options: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluate JavaScript.")
		.addStringOption((option) => option.setName("script").setDescription("Script that'd be ran.").setRequired(true))
		.toJSON(),
	permission: 5,
	run: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		try {
			let evaled = await eval("const Util = require('../util/Util'); " + interaction.options.get("script").value as string);
			if (typeof evaled != "string") evaled = require("util").inspect(evaled);

			if (evaled.length >= 2000) return await interaction.editReply("✅");

			return await interaction.editReply(`\`\`\`js\n${evaled}\n\`\`\``);
		} catch (e) {
			let err;
			if (typeof e == "string") err = e.replace(/`/g, "`" + String.fromCharCode(8203));
			else err = e;

			return await interaction.editReply(`\`\`\`fix\n${err}\n\`\`\``);
		};
	}
};