import fastify from "fastify";
import fs from "node:fs/promises";
import config from "../config";
import webserverLogger from "../utils/logger/webserver";

const app = fastify();

app.get<{ Params: { nickname?: string } }>("/playerdata/:nickname/skin.png", async (request, reply) => {
    const nickname = request.params.nickname;

    if (
        !await fs.stat(`./playerdata/${nickname}`).catch(() => void reply.status(404).send("Not found")) ||
        !await fs.stat(`./playerdata/${nickname}/skin.png`).catch(() => void reply.status(404).send("Not found"))
    ) return;

    const skin = await fs.readFile(`./playerdata/${nickname}/skin.png`);

    reply
        .header("Content-Type", "image/png")
        .send(skin);
});

app.get<{ Params: { nickname?: string } }>("/playerdata/:nickname/cape.png", async (request, reply) => {
    const nickname = request.params.nickname;

    if (
        !await fs.stat(`./playerdata/${nickname}`).catch(() => void reply.status(404).send("Not found")) ||
        !await fs.stat(`./playerdata/${nickname}/cape.png`).catch(() => void reply.status(404).send("Not found"))
    ) return;

    const cape = await fs.readFile(`./playerdata/${nickname}/cape.png`);

    reply
        .header("Content-Type", "image/png")
        .send(cape);
});

app.listen({
    port: config.port,
    host: "0.0.0.0"
}).then(() => {
    webserverLogger.info(`Server is listening on ${config.port}`);
});