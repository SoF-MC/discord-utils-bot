"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = void 0;
const bulks = new Map(), rates = new Map();
const deleteMessage = (message) => {
    const rate = rates.get(message.channel.id) || 0;
    rates.set(message.channel.id, rate + 1);
    setTimeout(() => rates.set(message.channel.id, rates.get(message.channel.id) - 1), 8000);
    const bulk = bulks.get(message.channel.id) || [];
    if (bulk.length)
        bulk.push(message);
    else if (rate < 4)
        message.delete().catch(() => null);
    else {
        bulks.set(message.channel.id, [message]);
        setTimeout(() => {
            message.channel.bulkDelete(bulks.get(message.channel.id)).catch(() => null);
            bulks.delete(message.channel.id);
        }, 5000);
    }
    ;
};
exports.deleteMessage = deleteMessage;
