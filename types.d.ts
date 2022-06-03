import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10"
import { CommandInteraction } from "discord.js"

export interface Config {
    token: string,
    database_uri: string,
    admins: string[],
    rcon: {
        host: string,
        port: number,
        password: string
    }
}

export interface UserData {
    user: string,
    nickname?: string,
    permissions: 0 | 1 | 2 | 3 | 4 | 5,
    ticketData?: {
        nickname?: string,
        age?: number,
        short?: string,
        long?: string
    }
}

export interface GlobalObject {
    ticketMessage: string
}

export interface TicketObject {
    user: string,
    channel: string,
    closed: boolean,
    originalMessage: string,
    state: 0 | 1,
    data: {
        nickname?: string,
        age?: number,
        short?: string,
        long?: string
    }
}

export interface SlashCommand {
    options: RESTPostAPIApplicationCommandsJSONBody,
    permission: 0 | 1 | 2 | 3 | 4 | 5,
    run(interaction: CommandInteraction): Promise<any>
}