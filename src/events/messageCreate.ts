import { Message } from "discord.js";
import mentionCommands from "../handlers/mentionCommands";
import config from "../config";

export async function run(message: Message<true>) {
    if (message.author.bot) return;

    if (message.content.startsWith(`<@${message.client.user.id}> `) && config.admins.includes(message.author.id))
        return mentionCommands(message);
}
