import type { Awaitable, Message, MessageEditOptions, MessageReplyOptions } from "discord.js";
import { readdirSync } from "fs";

export interface MentionCommand {
    names: [string, ...string[]];
    ownerOnly?: true;
    testArgs(args: string[]): boolean;
    execute(message: Message<true>, reply: (content: string | MessageEditOptions & MessageReplyOptions) => Promise<Message>, args: string[]): Awaitable<void>;
};

export const quickResponses: Array<[
    triggers: [string, ...string[]],
    response: string,
]> = [];

export const allMentionCommands = readdirSync(__dirname)
    .filter(file => !file.includes("index") && (file.endsWith(".js") || file.endsWith(".ts")))
    .map(file => require(`./${file}`).default as MentionCommand);