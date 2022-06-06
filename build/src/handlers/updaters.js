"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Util_1 = __importDefault(require("../util/Util"));
const minecraft_server_util_1 = __importDefault(require("minecraft-server-util"));
const config_1 = __importDefault(require("../../config"));
const statusChannelRcon = new minecraft_server_util_1.default.RCON();
async function updateStatusChannel() {
    const channel = Util_1.default.client.channels.cache.get("972838371128930324");
    const message = await channel.messages.fetch("972838825636286464");
    if (!statusChannelRcon.isConnected)
        try {
            await statusChannelRcon.connect(config_1.default.rcon.host, config_1.default.rcon.port);
            await statusChannelRcon.login(config_1.default.rcon.password);
        }
        catch {
            return;
        }
    ;
    const tpsResponse = await statusChannelRcon.execute("tps");
    const bluemapResponse = await statusChannelRcon.execute("bluemap");
    await message.edit({
        embeds: [{
                title: "/tps",
                description: "```\n" + tpsResponse + "\n```",
            }, {
                title: "/bluemap",
                description: "```\n" + bluemapResponse + "\n```",
            }]
    });
}
;
module.exports = () => {
    setInterval(() => updateStatusChannel(), 5 * 1000);
};
