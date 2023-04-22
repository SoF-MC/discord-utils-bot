import { msToHumanShortTime } from "../../utils/time";
import type { MentionCommand } from ".";

export default {
    names: ["ping", "pong", ""],
    testArgs: (args) => args.length === 0,
    execute: async (message, reply) => {
        const now = Date.now();
        const botMessage = await reply("〽️ Pinging...");
        return void botMessage.edit(`🏓 Server latency is \`${Date.now() - now}ms\`, shard latency is \`${Math.ceil(message.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(message.client.uptime)}\`.`);
    }
} satisfies MentionCommand;