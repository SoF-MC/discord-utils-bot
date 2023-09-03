import { ButtonInteraction, ComponentType, Message, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ButtonStyle, escapeMarkdown } from "discord.js";
import { getGlobalDocument, getUserDocument, Ticket, User } from "../database";
import { clearMcColors } from "../constants";
import { RCON } from "mc-server-utilities";
import config from "../config";

export const processButton = async (interaction: ButtonInteraction<"cached">) => {
    if (
        interaction.channel!.isDMBased()
        || interaction.channel!.isThread()
    ) return;

    const globalDocument = await getGlobalDocument();
    const userDocument = await getUserDocument(interaction.user.id);
    const buttonId = interaction.customId;

    if (buttonId === "tickets:create") {
        if (
            ![
                "419892040726347776",       // djoh
                "684472142804549637",       // padow
                "602492362136092720",       // vladirus
                "525748937349529602"        // srit
            ].includes(interaction.user.id) &&
            !globalDocument.ticketsEnabled
        ) return await interaction.reply({
            content: "завтра",
            ephemeral: true
        });

        let ticket = await Ticket.findOne({ user: interaction.user.id });

        if (!ticket) {
            await interaction.reply({
                content: "Создаю канал...",
                ephemeral: true
            });

            const channel = await interaction.guild.channels.create({
                name: `заявка-${interaction.user.tag}`,
                permissionOverwrites: [{
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                }],
                rateLimitPerUser: 2,
                parent: "962401942670282773"
            });

            ticket = await Ticket.create({ user: interaction.user.id, channel: channel.id });

            await interaction.editReply("Почти готово...");

            await channel.permissionOverwrites.create(interaction.user, { ViewChannel: true });

            const originalMessage = await channel.send({
                content: "Нажимайте на кнопки ниже чтобы заполнить заявку.",
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder().setLabel("1").setCustomId("tickets:1").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("2").setCustomId("tickets:2").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("3").setCustomId("tickets:3").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("4").setCustomId("tickets:4").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("5").setCustomId("tickets:5").setStyle(ButtonStyle.Primary)
                    ]),
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder().setLabel("да").setCustomId("tickets:accept").setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setLabel("нет").setCustomId("tickets:close").setStyle(ButtonStyle.Danger)
                    ])
                ]
            });

            await originalMessage.pin();

            await ticket.updateOne({ $set: { originalMessage: originalMessage.id } });

            await interaction.editReply("Готово!");
        } else await interaction.reply({
            content: "У вас уже есть заявка",
            ephemeral: true
        });
    } else if (buttonId === "tickets:reopen") {
        if (
            userDocument.permissions < 2
        ) return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        await interaction.message.delete().catch(() => null);
        await interaction.channel!.permissionOverwrites.create(ticket.user, { ViewChannel: true });

        await ticket.updateOne({ $set: { closed: false } });
    } else if (buttonId === "tickets:close") {
        if (
            userDocument.permissions < 2
        ) return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;
        await interaction.channel!.permissionOverwrites.delete(ticket.user);

        await interaction.reply({
            content: "ок",
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder().setLabel("открыть обратно").setCustomId("tickets:reopen").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setLabel("удалить нахуй").setCustomId("tickets:delete").setStyle(ButtonStyle.Danger)
            ])]
        });

        await ticket.updateOne({ $set: { closed: true } });
    } else if (buttonId === "tickets:accept") {
        if (
            userDocument.permissions < 2
        ) return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });

        if (!(await check(interaction))) return;

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        const anotherUserDocument = await getUserDocument(ticket.user);
        anotherUserDocument.nickname = ticket.data.nickname;
        anotherUserDocument.safeSave();

        const rcon = new RCON();
        await rcon.connect(config.rcon.main.host, config.rcon.main.port);
        await rcon.login(config.rcon.main.password);
        const result = await rcon.execute(`easywl add ${ticket.data.nickname}`);
        rcon.close();

        const main = escapeMarkdown(clearMcColors(result));

        await interaction.editReply([
            "main:",
            main
        ].join("\n"));

        await interaction.channel!.send({
            content: `<@${ticket.user}>,`,
            embeds: [{
                author: {
                    icon_url: interaction.user.displayAvatarURL(),
                    name: interaction.user.tag
                },
                title: "Поздравляю!",
                description: [
                    "Вы были приняты на сервер!",
                    "Айпи сервера: `soff.pro`"
                ].join("\n")
            }]
        });

        await interaction.guild.members.addRole({ user: ticket.user, role: "791657594228965377" }).catch(() => null);
    } else if (buttonId === "tickets:delete") {
        if (
            userDocument.permissions < 2
        ) return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });

        await Ticket.deleteOne({ channel: interaction.channel!.id });

        await interaction.channel!.delete();
    } else if (buttonId === "tickets:1") {
        await interaction.reply("У вас есть **30 секунд**, чтобы написать свой желаемый никнейм в этом канале.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            30_000
        );
        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 30_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const nick = message.content?.match(/^[a-zA-Z0-9_]{3,16}$/mg)?.[0];

        if (
            !nick ||
            nick.length !== message.content.length
        ) return interaction.editReply("Никнейм должен состоять из латинских букв и цифр, не менее 3 и не более 16 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 5_000));

        if (await User.findOne({ nickname: nick.trim() }))
            return interaction.editReply("Этот никнейм уже используется.")
                .then(() => setTimeout(() => {
                    interaction.deleteReply().catch(() => null);
                    message.delete().catch(() => null);
                }, 5_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Никнейм принят, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.nickname = nick.trim();

        await ticket.save();

        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");

        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:2") {
        await interaction.reply("У вас есть **10 секунд**, чтобы написать свой возраст в этом канале.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            10_000
        );
        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 10_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const age = message.content.match(/^[0-9]{2}$/mg)?.[0];

        if (
            !age ||
            age.length !== message.content.length
        ) return await interaction.editReply("Возраст должен состоять из цифр, не менее и не более 2 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 5_000));

        if (parseInt(age) < 13)
            return await interaction.editReply("дискорд 13+");

        await message.delete().catch(() => null);
        await interaction.editReply("Возраст принят, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.age = parseInt(age);

        await ticket.save();

        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");

        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:3") {
        await interaction.reply("Откуда Вы узнали о нас? Если от друга, от какого именно? У вас есть 2 минуты.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            120_000
        );

        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120_000 })).first();
        if (!message) return;

        clearTimeout(timeout);
        const otkuda = message.content;

        if (
            !otkuda ||
            (otkuda.length < 8 || otkuda.length > 512)
        ) return await interaction.editReply("Длина ответа должна составлять от 8 до 512 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 6_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.otkuda = otkuda;

        await ticket.save();

        await updateMessage(interaction.message);

        await interaction.editReply("Готово.");
        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:4") {
        await interaction.reply("Сколько времени Вы готовы уделять серверу? У Вас есть 2 минуты.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            120_000
        );

        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120_000 })).first();
        if (!message) return;

        clearTimeout(timeout);
        const skolko = message.content;

        if (
            !skolko ||
            (skolko.length < 8 || skolko.length > 512)
        ) return await interaction.editReply("Длина ответа должна составлять от 8 до 512 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 6_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.skolko = skolko;

        await ticket.save();

        await updateMessage(interaction.message);

        await interaction.editReply("Готово.");
        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:5") {
        await interaction.reply("Расскажите о себе (150+ символов). У вас есть 10 минут.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            600_000
        );

        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 600_000 })).first();
        if (!message) return;

        clearTimeout(timeout);
        const kto = message.content;

        if (
            !kto ||
            (kto.length < 150 || kto.length > 1800)
        ) return await interaction.editReply("Длина ответа должна составлять от 150 до 1800 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 6_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.kto = kto;

        await ticket.save();

        await updateMessage(interaction.message);

        await interaction.editReply("Готово.");
        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    };
};

async function updateMessage(message: Message<true>) {
    const ticket = (await Ticket.findOne({ channel: message.channel.id }))!;

    return await message.edit({
        embeds: [{
            fields: [{
                name: "Никнейм",
                value: `\`${ticket.data.nickname || "Пусто"}\``,
                inline: true
            }, {
                name: "Возраст",
                value: `\`${ticket.data.age || "Пусто"}\``,
                inline: true
            }, {
                name: "откуда",
                value: `${ticket.data.otkuda || "Пусто"}`
            }, {
                name: "сколько",
                value: `${ticket.data.skolko || "Пусто"}`
            }, {
                name: "о себе",
                value: `${ticket.data.kto || "Пусто"}`
            }]
        }]
    });
};

async function check(interaction: ButtonInteraction): Promise<boolean> {
    const message = await interaction.reply({
        content: "tochno?",
        ephemeral: true,
        fetchReply: true,
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder().setLabel("da").setStyle(ButtonStyle.Success).setCustomId("tickets:check:yes"),
                new ButtonBuilder().setLabel("net").setStyle(ButtonStyle.Danger).setCustomId("tickets:check:no")
            ])
        ]
    });

    const collected = await message.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (b) => b.user.id === interaction.user.id && b.customId === "tickets:check:yes" || b.customId === "tickets:check:no"
    });

    return collected.customId === "tickets:check:yes";
};