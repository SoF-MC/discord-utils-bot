import { GuildTextBasedChannel, Message } from "discord.js";

const bulks = new Map(), rates = new Map();

export const deleteMessage = (message: Message) => {
    const rate = rates.get(message.channel.id) || 0;
    rates.set(message.channel.id, rate + 1);

    setTimeout(() => rates.set(message.channel.id, rates.get(message.channel.id) - 1), 8000);

    const bulk = bulks.get(message.channel.id) || [];
    if (bulk.length) bulk.push(message);
    else if (rate < 4) message.delete().catch(() => null);
    else {
        bulks.set(message.channel.id, [message]);
        setTimeout(() => {
            (message.channel as GuildTextBasedChannel).bulkDelete(bulks.get(message.channel.id)).catch(() => null);
            bulks.delete(message.channel.id);
        }, 5000);
    };
};