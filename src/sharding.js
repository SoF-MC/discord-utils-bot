require("nodejs-better-console").overrideConsole();
const Discord = require("discord.js");
const config = require("../config");

const manager = new Discord.ShardingManager("./src/bot.js", {
    totalShards: 1,
    token: config.token,
    mode: "worker"
});

manager.on("shardCreate", shard => {
    shard.on("message", m => {
        if (m == "respawn") {
            console.log(`[Manager] Shard ${shard.id} has requested a restart.`);
            shard.respawn();
        };
    });
    console.log(`[Manager] Shard ${shard.id} is starting.`);
});

manager.spawn();