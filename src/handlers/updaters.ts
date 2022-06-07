import { TextChannel } from "discord.js";
import Util from "../util/Util";
import { RCON } from "minecraft-server-util";
import config from "../../config";

export = () => {
    //updateStatusChannel();

    //setInterval(() => updateStatusChannel(), 5 * 1000);
};

const statusChannelRcon = new RCON();
async function updateStatusChannel() {
    const channel = Util.client.channels.cache.get("972838371128930324") as TextChannel;
    const message = await channel.messages.fetch("972838825636286464");

    if (!statusChannelRcon.isConnected) try {
        await statusChannelRcon.connect(config.rcon.host, config.rcon.port);
        await statusChannelRcon.login(config.rcon.password);
    } catch { return; };
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
};