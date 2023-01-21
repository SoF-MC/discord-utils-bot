import { Message } from "discord.js";
import mentionCommands from "../handlers/mentionCommands";
import config from "../config";

export async function run(_: Message, message: Message<true>) {
    if (message.partial) message.fetch().catch((e) => {
        if (e.code !== 10008) throw e;
    });
    if (message.author.bot) return;

    if (
        message.content.startsWith(`<@${message.client.user.id}> `)
        && config.admins.includes(message.author.id)
    ) return mentionCommands(message);
};