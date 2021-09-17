module.exports = {
    description: "привет :D",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 3, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 1
};

const { SSH } = require("../../config");
const { Client } = require("ssh2");

module.exports.run = async (message, args) => {
    const toUnproxy = String(args[0]).toLowerCase().trim();
    if (!gldb.get().domains.includes(toUnproxy)) return message.channel.send("Domain isn't linked");
    let m = await message.channel.send("SSH: Connecting...");

    let conn = new Client();
    conn.connect({
        host: SSH.host,
        port: SSH.port,
        username: SSH.user,
        password: SSH.password
    });

    conn.on('ready', () => {
        m.edit("SSH: Connected!\nUnproxying...");
        conn.exec("rm /etc/apache2/sites-enabled/" + toUnproxy + ".conf && sudo systemctl restart apache2 && sleep 1 && echo \"complete\"", (err, stream) => {
            if (!!err) throw err;
            stream.on('close', () => {
                conn.end();
            }).on('data', () => {
                gldb.removeFromArray("domains", toUnproxy);
                m.edit("Server unproxied!");
            }).stderr.on('data', () => {
                gldb.removeFromArray("domains", toUnproxy);
                m.edit("Server unproxied!");
            });
        });
    });
};