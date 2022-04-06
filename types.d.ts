import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10"
import { CommandInteraction, PermissionResolvable } from "discord.js"

export interface Config {
    token: string,
    database_uri: string,
    admins: string[],
    rcon: {
        host: string,
        password: string
    }
}

interface UserData {
    id: string,
    nickname?: string,
    permissions?: 0 | 1 | 2 | 3 | 4 | 5
}

export interface GlobalObject {
    userdata: UserData[]
}

export interface SlashCommand {
    options: RESTPostAPIApplicationCommandsJSONBody,
    permission: 0 | 1 | 2 | 3 | 4 | 5,
    run(interaction: CommandInteraction): Promise<void>
}