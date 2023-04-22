import { readdirSync } from "fs";
import { FirstLevelChatInputCommand, SecondLevelChatInputCommand } from "..";

const accountSubcommands = readdirSync(__dirname)
    .filter(file => !file.includes("index"))
    .map(file => require(`./${file}`).default as SecondLevelChatInputCommand) as [SecondLevelChatInputCommand, ...SecondLevelChatInputCommand[]];

export default {
    name: "account",
    description: "аккаунт",
    subcommands: accountSubcommands
} satisfies FirstLevelChatInputCommand;