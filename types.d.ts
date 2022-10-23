import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10"
import { ChatInputCommandInteraction } from "discord.js"

export interface Config {
    token: string;
    database_uri: string;
}

export interface UserData {
    user: string;
    nickname?: string;
    registered?: boolean;
    permissions: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface GlobalObject {
    ticketMessage: string;
    ticketsEnabled: boolean;
}

export interface TicketObject {
    user: string;
    channel: string;
    closed: boolean;
    originalMessage: string;
    state: 0 | 1;
    data: {
        nickname?: string;
        age?: number;
        short?: string;
        long?: string;
    };
}

export interface SlashCommand {
    options: RESTPostAPIApplicationCommandsJSONBody;
    permission: 0 | 1 | 2 | 3 | 4 | 5;
    run(interaction: ChatInputCommandInteraction): Promise<any>;
}