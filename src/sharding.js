require("nodejs-better-console").overrideConsole();
const Discord = require("discord.js");
const config = require("../config");

const manager = new Discord.ShardingManager("./src/bot.js", {
    totalShards: 1,
    token: config.token,
    mode: "worker"
});

manager.on("shardCreate", (shard) => {
    console.log(`[Manager] Shard ${shard.id} is starting.`);
});

manager.spawn();