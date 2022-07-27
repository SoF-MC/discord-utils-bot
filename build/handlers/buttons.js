"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processButton = void 0;
const discord_js_1 = require("discord.js");
const minecraft_server_util_1 = require("minecraft-server-util");
const config_1 = __importDefault(require("../../config"));
const Util_1 = __importDefault(require("../util/Util"));
const processButton = async (interaction) => {
    if (interaction.channel.type !== "GUILD_TEXT")
        return;
    const buttonId = interaction.customId;
    const ticketsModel = Util_1.default.mongoose.model("tickets");
    if (buttonId === "tickets:create") {
        if (![
            "419892040726347776",
            "684472142804549637",
            "602492362136092720",
            "525748937349529602"
        ].includes(interaction.user.id) &&
            !Util_1.default.database.global.get().ticketsEnabled)
            return await interaction.reply({
                content: "пошёл нахуй",
                ephemeral: true
            });
        const ticket = await ticketsModel.findOne({ user: interaction.user.id });
        if (!ticket) {
            await interaction.reply({
                content: "Создаю канал...",
                ephemeral: true
            });
            const channel = await interaction.guild.channels.create(`заявка-${interaction.user.tag}`, {
                permissionOverwrites: [{
                        id: interaction.guild.id,
                        deny: ["VIEW_CHANNEL"],
                    }],
                rateLimitPerUser: 2,
                parent: "962401942670282773"
            });
            await interaction.editReply("Канал создан, создаю записи в БД...");
            await ticketsModel.create({ user: interaction.user.id, channel: channel.id, state: 0 });
            await interaction.editReply("Почти готово...");
            await channel.permissionOverwrites.create(interaction.user, { VIEW_CHANNEL: true });
            await channel.permissionOverwrites.create("529964966254739476", { VIEW_CHANNEL: true });
            await channel.permissionOverwrites.create("675429015141744675", { VIEW_CHANNEL: true });
            await channel.permissionOverwrites.create("525748937349529602", { VIEW_CHANNEL: true });
            const originalMessage = await channel.send({
                content: "Нажимайте на кнопки ниже чтобы заполнить заявку.",
                components: [
                    new discord_js_1.MessageActionRow().addComponents([
                        new discord_js_1.MessageButton().setLabel("user:").setCustomId("dummy_g2HVZR").setStyle("SECONDARY").setDisabled(true),
                        new discord_js_1.MessageButton().setLabel("Первый вопрос").setCustomId("tickets:setnick").setStyle("PRIMARY"),
                        new discord_js_1.MessageButton().setLabel("Второй вопрос").setCustomId("tickets:setage").setStyle("PRIMARY"),
                        new discord_js_1.MessageButton().setLabel("Третий вопрос").setCustomId("tickets:setshort").setStyle("PRIMARY"),
                        new discord_js_1.MessageButton().setLabel("Второй этап").setCustomId("tickets:setlong").setStyle("PRIMARY"),
                    ]),
                    new discord_js_1.MessageActionRow().addComponents([
                        new discord_js_1.MessageButton().setLabel("admin:").setCustomId("dummy_U4Fr8y").setStyle("SECONDARY").setDisabled(true),
                        new discord_js_1.MessageButton().setLabel("Принять").setCustomId("tickets:accept").setStyle("SUCCESS"),
                        new discord_js_1.MessageButton().setLabel("Закрыть").setCustomId("tickets:close").setStyle("DANGER")
                    ])
                ]
            });
            await originalMessage.pin();
            await ticketsModel.findOneAndUpdate({ user: interaction.user.id }, { $set: { originalMessage: originalMessage.id } });
            await interaction.editReply("Готово!");
        }
        else
            await interaction.reply({
                content: "У вас уже есть заявка",
                ephemeral: true
            });
    }
    else if (buttonId === "tickets:reopen") {
        if ((await Util_1.default.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON().permissions < 2)
            return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        await interaction.message.delete().catch(() => null);
        await interaction.channel.permissionOverwrites.create(ticket.user, { VIEW_CHANNEL: true });
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { closed: false } });
    }
    else if (buttonId === "tickets:close") {
        if ((await Util_1.default.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON().permissions < 2)
            return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        await interaction.channel.permissionOverwrites.delete(ticket.user);
        await interaction.channel.send({
            content: "ну чё обсуждайте хуле",
            components: [new discord_js_1.MessageActionRow().addComponents([
                    new discord_js_1.MessageButton().setLabel("открыть обратно").setCustomId("tickets:reopen").setStyle("SUCCESS"),
                    new discord_js_1.MessageButton().setLabel("удалить нахуй").setCustomId("tickets:delete").setStyle("DANGER")
                ])]
        });
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { closed: true } });
    }
    else if (buttonId === "tickets:accept") {
        if ((await Util_1.default.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON().permissions < 2)
            return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (ticket.state !== 1) {
            if (!(await check(interaction)))
                return;
            await interaction.channel.send({
                content: `<@${ticket.user}>,`,
                embeds: [{
                        author: {
                            iconURL: interaction.user.avatarURL(),
                            name: interaction.user.tag
                        },
                        title: "Вы прошли первый этап",
                        description: "Когда будете готовы, нажимайте на кнопку \"Второй этап\"."
                    }]
            });
            await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { state: 1 } });
        }
        else {
            if (!(await check(interaction)))
                return;
            const rcon = new minecraft_server_util_1.RCON();
            await interaction.editReply("Подключаюсь к серверу...");
            await rcon.connect(config_1.default.rcon.host, config_1.default.rcon.port);
            await rcon.login(config_1.default.rcon.password);
            await interaction.editReply("Отправляю команду...");
            const reply = await rcon.execute(`easywl add ${ticket.data.nickname}`);
            rcon.close();
            await interaction.editReply(`Ответ сервера: ${Util_1.default.clearMcColors(reply)}`);
            await interaction.channel.send({
                content: `<@${ticket.user}>,`,
                embeds: [{
                        author: {
                            iconURL: interaction.user.avatarURL(),
                            name: interaction.user.tag
                        },
                        title: "Поздравляю!",
                        description: [
                            "Вы были приняты на сервер!",
                            "Айпи: `soff.ml`",
                            "Версия: Java Edition 1.18.x",
                            "Карта: https://map.djoh.xyz"
                        ].join("\n")
                    }]
            });
            const member = await interaction.guild.members.fetch(ticket.user);
            await member.roles.add([
                "764180192829767750",
                "791657594228965377"
            ]).catch(() => null);
            await member.roles.remove([
                "764180408056414289"
            ]).catch(() => null);
            await Util_1.default.mongoose.model("userdata").findOneAndUpdate({ user: ticket.user }, { $set: { nickname: ticket.data.nickname, data: ticket.data } });
        }
        ;
    }
    else if (buttonId === "tickets:delete") {
        if ((await Util_1.default.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON().permissions < 2)
            return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });
        await ticketsModel.findOneAndDelete({ channel: interaction.channel.id });
        await interaction.channel.delete();
    }
    else if (buttonId === "tickets:setnick") {
        await interaction.reply("У вас есть **30 секунд**, чтобы написать свой никнейм в этом канале.");
        let timeout = setTimeout(async () => await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5000)), 30000);
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 30000 })).first();
        if (!message)
            return;
        clearTimeout(timeout);
        const nick = message.content?.match(/^[a-zA-Z0-9_]{2,16}$/mg)?.[0];
        if (!nick ||
            nick.length !== message.content.length)
            return await interaction.editReply("Никнейм должен состоять из латинских букв и цифр, не менее 2 и не более 16 символов.")
                .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 5000));
        await message.delete().catch(() => null);
        await interaction.editReply("Никнейм принят, обновляю в БД...");
        let { data } = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (!data)
            data = {};
        data.nickname = nick;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4000);
    }
    else if (buttonId === "tickets:setage") {
        await interaction.reply("У вас есть **10 секунд**, чтобы написать свой возраст в этом канале.");
        let timeout = setTimeout(async () => await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5000)), 12000);
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 10000 })).first();
        if (!message)
            return;
        clearTimeout(timeout);
        let age = message.content?.match(/^[0-9]{2}$/mg)?.[0];
        if (!age ||
            age.length !== message.content.length)
            return await interaction.editReply("Возраст должен состоять из цифр, не менее и не более 2 символов.")
                .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 6000));
        await message.delete().catch(() => null);
        await interaction.editReply("Возраст принят, обновляю в БД...");
        let { data } = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (!data)
            data = {};
        data.age = parseInt(age);
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4000);
    }
    else if (buttonId === "tickets:setshort") {
        await interaction.reply("У вас есть **2 минуты**, чтобы написать сколько планируете уделять времени серверу.");
        let timeout = setTimeout(async () => await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5000)), 120000);
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120000 })).first();
        if (!message)
            return;
        clearTimeout(timeout);
        const short = message.content;
        if (!short ||
            (short.length > 512 && short.length < 16))
            return await interaction.editReply("Длина ответа должна составлять от 16 до 512 символов.")
                .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 6000));
        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");
        let { data } = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (!data)
            data = {};
        data.short = short;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4000);
    }
    else if (buttonId === "tickets:setlong") {
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (ticket.state !== 1)
            return await interaction.reply("Вы ещё не прошли первый этап. Подождите пока администрация одобрит Ваши ответы.")
                .then(() => setTimeout(() => interaction.deleteReply(), 5000));
        await interaction.reply("У вас есть **10 минут**, чтобы написать краткое описание \"О себе\" и чем вы планируете заниматься на сервере.");
        let timeout = setTimeout(async () => await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5000)), 600000);
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 600000 })).first();
        if (!message)
            return;
        clearTimeout(timeout);
        const long = message.content;
        await interaction.editReply("Принято, обновляю в БД...");
        let { data } = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON();
        if (!data)
            data = {};
        data.long = long;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message);
        await interaction.editReply("Готово. (У вас есть 20 секунд, чтобы скопировать сообщение, в случае если хотите его ещё как-то дополнить.)");
        setTimeout(async () => {
            await interaction.deleteReply().catch(() => null);
            await message.delete().catch(() => null);
        }, 20000);
    }
    ;
    async function updateMessage(message) {
        const ticket = (await ticketsModel.findOne({ channel: message.channel.id })).toJSON();
        return await message.edit({
            embeds: [{
                    fields: [{
                            name: "Никнейм",
                            value: `\`${ticket.data?.nickname || "Пусто"}\``,
                            inline: true
                        }, {
                            name: "Возраст",
                            value: `\`${ticket.data?.age || "Пусто"}\``,
                            inline: true
                        }, {
                            name: "Планируемое время",
                            value: `${ticket.data?.short || "Пусто"}`
                        }, {
                            name: "Второй этап",
                            value: `${ticket.data?.long || "Пусто"}`
                        }]
                }]
        });
    }
    ;
    async function check(interaction) {
        const message = await interaction.reply({
            content: "tochno?",
            ephemeral: true,
            fetchReply: true,
            components: [
                new discord_js_1.MessageActionRow().addComponents([
                    new discord_js_1.MessageButton().setLabel("da").setStyle("SUCCESS").setCustomId("tickets:check:yes"),
                    new discord_js_1.MessageButton().setLabel("net").setStyle("DANGER").setCustomId("tickets:check:no")
                ])
            ]
        });
        const collected = await message.awaitMessageComponent({
            componentType: "BUTTON",
            filter: (b) => b.user.id === interaction.user.id && b.customId === "tickets:check:yes" || b.customId === "tickets:check:no"
        });
        return collected.customId === "tickets:check:yes";
    }
    ;
};
exports.processButton = processButton;
