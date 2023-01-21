import { exec } from "node:child_process";
import { Message } from "discord.js";

export const run = async (message: Message<true>, args: string[]) => {
    const script = args.join(" ");

    exec(script, (error, stdout) => {
        return message.reply({
            content: `\`\`\`\n${(error ?? stdout).toString().slice(0, 1990)}\n\`\`\``
        });
    });
};