require("nodejs-better-console").overrideConsole();
const Discord = require("discord.js");

const manager = new Discord.ShardingManager("./src/bot.js", {
    totalShards: 1,
    mode: "worker"
});

manager.on("shardCreate", (shard) => {
    console.log(`[Manager] Shard ${shard.id} is starting.`);
});

manager.spawn();