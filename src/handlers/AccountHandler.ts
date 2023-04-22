import { Client, GuildTextBasedChannel, Message } from "discord.js";
import config from "../config";

export default class AccountHandler {
    private client: Client;
    readonly username: string;

    private autoregChannel: GuildTextBasedChannel;

    constructor(client: Client, username: string) {
        this.client = client;
        this.username = username;

        this.autoregChannel = this.client.channels.cache.get(config.autoregChannelId) as GuildTextBasedChannel;
    };

    async register(password: string) {
        const filter = (message: Message) =>
            message.author.id === this.client.user!.id &&
            message.content.includes(`username='${this.username}'`);

        await this.autoregChannel.send(`l!config auth.std.core register ${this.username} email@example.com ${password}`);

        const message = await this.autoregChannel.awaitMessages({ filter, max: 1, time: 1000, errors: ["time"] }).catch(() => null);

        if (!message) return false;
        return true;
    };

    async setPassword(password: string) {
        const filter = (message: Message) =>
            message.author.id === this.client.user!.id &&
            message.content.includes("Password changed");

        await this.autoregChannel.send(`l!config auth.std.core changePassword ${this.username} ${password}`);

        const message = await this.autoregChannel.awaitMessages({ filter, max: 1, time: 1000, errors: ["time"] }).catch(() => null);

        if (!message) return false;
        return true;
    };
};