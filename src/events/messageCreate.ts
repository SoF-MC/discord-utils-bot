import type { Message } from "discord.js";
import mentionCommands from "../handlers/mentionCommands";
import config from "../config";
import fs from "fs";
import path from "path";

function escapeString(word: string) {
    return word.replace(/"/g, '\\"');
}

export async function run(message: Message<true>) {
    if (message.author.bot) return;

    if (message.content.startsWith(`<@${message.client.user.id}> `) && config.admins.includes(message.author.id))
        return mentionCommands(message);

    let counter = 0;
    const filename = path.join("databases", `wordsdb_${message.guildId}.txt`);

    if (!fs.existsSync(filename)) fs.writeFileSync(filename, "");

    if (message.author.id !== "824379835262304257") {
        const words = message.content.split(" ");
        fs.appendFileSync(filename, words.map(escapeString).join(" ") + " ");
    }

    const handleCounter = async () => {
        counter++;
        if (counter >= 25) {
            const wordsStr = fs.readFileSync(filename, "utf8");
            const words = wordsStr.split(" ");
            if (words.length > 0) {
                const numWords = Math.min(Math.floor(Math.random() * 10) + 1, words.length);
                const expression = words.slice(0, numWords).join(" ");
                await message.channel.send(expression);
            }

            counter = 0;
        }
    };

    if (message.guildId === "764178286233518100") {
        if (message.channel.id === "764179432147124304") {
            const wordsStr = fs.readFileSync(filename, "utf8");
            const words = wordsStr.split(" ");
            if (words.length > 0) {
                const numWords = Math.min(Math.floor(Math.random() * 15) + 1, words.length);
                const expression = words.slice(0, numWords).join(" ");
                await message.channel.send(expression);
            }

            counter = 0;
        }

        if (counter > 0) handleCounter();
        if (message.mentions.has("824379835262304257")) handleCounter();
    } else {
        if (counter > 0) handleCounter();
        if (message.mentions.has("824379835262304257")) handleCounter();
    }
}
