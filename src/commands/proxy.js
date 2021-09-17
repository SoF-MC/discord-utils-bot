module.exports = {
    description: "привет :D",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 3, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => args.length == 2
};

const { SSH } = require("../../config");
const { Client } = require("ssh2");

module.exports.run = async (message, args) => {
    const toProxy = String(args[0]).toLowerCase().trim();
    const proxy = SSH.ip;
    const port = args[1];
    if (gldb.get().domains.includes(toProxy)) return message.channel.send('Domain is already linked');

    let m = await message.reply('Please give me a few seconds! \nProcess: Connecting to SSH...');

    let conn = new Client();
    conn.connect({
        host: SSH.host,
        port: SSH.port,
        username: SSH.user,
        password: SSH.password
    });

    conn.on('ready', () => {
        m.edit('Please give me a few seconds! \nProcess: SSH connected. \nNext: Making SSL cert... **This will take a few seconds**');
        conn.exec('sudo certbot certonly --apache -n --keep --redirect --agree-tos -d' + toProxy, (err, stream) => {
            if (!!err) throw err;
            stream.on('close', () => { }).on('data', (data) => {
                log.log(data);
                if (data.includes("Congratulations!")) {
                    m.edit([
                        "Please give me a few seconds!",
                        "Process: SSL Complete.",
                        "Next: Write proxy file. **Sometimes this gets stuck, If it takes more than 10seconds run the command again**"
                    ].join("\n"));
                    conn.exec(`echo "<VirtualHost *:80>
    ServerName ${toProxy}
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L] 
</VirtualHost>
<VirtualHost *:443>
    ServerName ${toProxy}
    ProxyRequests off
    SSLProxyEngine on
    ProxyPreserveHost On
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${toProxy}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${toProxy}/privkey.pem

    <Location />
        ProxyPass http://${proxy}:${port}/
        ProxyPassReverse http://${proxy}:${port}/
    </Location>
</VirtualHost>" > /etc/apache2/sites-enabled/${toProxy}.conf && sleep 1 && echo "complete"`, (err, stream) => {
                        if (!!err) throw err;
                        stream.on('close', () => { }).on('data', () => {
                            log.log(data);
                            m.edit('Please give me a few seconds! \nProcess: Proxy file written. \nNext: Reload webserver.');
                            setTimeout(() => {
                                conn.exec("sudo systemctl restart apache2 && echo \"complete\"", (err, stream) => {
                                    if (err) throw err;
                                    stream.on('close', () => { }).on('data', () => {
                                        m.edit('Domain linking complete!');
                                        gldb.addToArray("domains", toProxy);
                                        conn.end();
                                    });
                                });
                            }, 2000);
                        });
                    });
                } else if (data.includes("Certificate not yet due for renewal")) {
                    m.edit([
                        "Please give me a few seconds!",
                        "Process: SSL Complete.",
                        "Next: Write proxy file. **Sometimes this gets stuck, If it takes more than 10seconds run the command again**"
                    ].join("\n"));
                    conn.exec(`echo  "<VirtualHost *:80>
    ServerName ${toProxy}
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L] 
</VirtualHost>
<VirtualHost *:443>
    ServerName ${toProxy}
    ProxyRequests off
    SSLProxyEngine on
    ProxyPreserveHost On
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${toProxy}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${toProxy}/privkey.pem

    <Location />
        ProxyPass http://${proxy}:${port}/
        ProxyPassReverse http://${proxy}:${port}/
    </Location>
</VirtualHost>" > /etc/apache2/sites-enabled/${toProxy}.conf && sleep 1 && echo "complete"`, (err, stream) => {
                        if (!!err) throw err;
                        stream.on('close', () => { }).on('data', (data) => {
                            log.log(data);
                            m.edit('Please give me a few seconds! \nProcess: Proxy file written. \nNext: Reload webserver.');
                            setTimeout(() => {
                                conn.exec("sudo systemctl restart apache2 && echo \"complete\"", (err, stream) => {
                                    if (err) throw err;
                                    stream.on('close', () => { }).on('data', () => {
                                        log.log(data);
                                        m.edit('Domain linking complete!');
                                        gldb.addToArray("domains", toProxy);
                                        conn.end();
                                    });
                                });
                            }, 2000);
                        });
                    });
                } else {
                    m.edit(`ERROR, SSL failed to connect. Is your domain pointing to the correct ip address?\nReverse Proxy ip is: \`${proxy}\``);
                };
            });
        });
    });
};