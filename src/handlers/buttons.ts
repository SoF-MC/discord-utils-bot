import { ButtonInteraction, ComponentType, Message, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ButtonStyle } from "discord.js";
import { getGlobalDocument, getUserDocument, Ticket, User } from "../database";
import { clearMcColors } from "../constants";
import { RCON } from "minecraft-server-util";
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
            content: "пошёл нахуй",
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
            await channel.permissionOverwrites.create(
                await interaction.client.users.fetch("529964966254739476"),
                { ViewChannel: true }
            ); // streamking

            const originalMessage = await channel.send({
                content: "Нажимайте на кнопки ниже чтобы заполнить заявку.",
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder().setLabel("user:").setCustomId("dummy_g2HVZR").setStyle(ButtonStyle.Secondary).setDisabled(true),
                        new ButtonBuilder().setLabel("Первый вопрос").setCustomId("tickets:setnick").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("Второй вопрос").setCustomId("tickets:setage").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("Третий вопрос").setCustomId("tickets:setshort").setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setLabel("Второй этап").setCustomId("tickets:setlong").setStyle(ButtonStyle.Primary),
                    ]),
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder().setLabel("admin:").setCustomId("dummy_U4Fr8y").setStyle(ButtonStyle.Secondary).setDisabled(true),
                        new ButtonBuilder().setLabel("Принять").setCustomId("tickets:accept").setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setLabel("Закрыть").setCustomId("tickets:close").setStyle(ButtonStyle.Danger)
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
            content: "ну чё обсуждайте хуле",
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

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        if (ticket.state !== 1) {
            if (!(await check(interaction))) return;

            await interaction.channel!.send({
                content: `<@${ticket.user}>,`,
                embeds: [{
                    author: {
                        icon_url: interaction.user.displayAvatarURL(),
                        name: interaction.user.tag
                    },
                    title: "Вы прошли первый этап",
                    description: "Когда будете готовы, нажимайте на кнопку \"Второй этап\"."
                }]
            });

            await ticket.updateOne({ $set: { state: 1 } });
        } else {
            if (!(await check(interaction))) return;

            const anotherUserDocument = await getUserDocument(ticket.user);
            anotherUserDocument.nickname = ticket.data.nickname;
            anotherUserDocument.safeSave();

            const rcon = new RCON();
            await rcon.connect(config.rcon.host, config.rcon.port);
            await rcon.login(config.rcon.password);
            const result = await rcon.execute(`easywl add ${ticket.data.nickname}`);
            rcon.close();

            await interaction.editReply(clearMcColors(result));

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
                        "Данные для входа:",
                        "Айпи сервера: `soff.ml`",
                        "Сайт: [`soff.ml`](https://soff.ml)"
                    ].join("\n")
                }]
            });

            await interaction.guild.members.addRole({ user: ticket.user, role: "791657594228965377" }).catch(() => null);
        };
    } else if (buttonId === "tickets:delete") {
        if (
            userDocument.permissions < 2
        ) return await interaction.reply({ content: "❌ У вас недостаточно прав.", ephemeral: true });

        await Ticket.deleteOne({ channel: interaction.channel!.id });

        await interaction.channel!.delete();
    } else if (buttonId === "tickets:setnick") {
        await interaction.reply("У вас есть **30 секунд**, чтобы написать свой желаемый никнейм в этом канале.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            30_000
        );
        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 30_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const nick = message.content?.match(/^[a-zA-Z0-9_]{2,16}$/mg)?.[0];

        if (
            !nick ||
            nick.length !== message.content.length
        ) return interaction.editReply("Никнейм должен состоять из латинских букв и цифр, не менее 2 и не более 16 символов.")
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
    } else if (buttonId === "tickets:setage") {
        await interaction.reply("У вас есть **10 секунд**, чтобы написать свой возраст в этом канале.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            10_000
        );
        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 10_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        let age = message.content?.match(/^[0-9]{2}$/mg)?.[0];

        if (
            !age ||
            age.length !== message.content.length
        ) return await interaction.editReply("Возраст должен состоять из цифр, не менее и не более 2 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 5_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Возраст принят, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.age = parseInt(age);

        await ticket.save();

        await updateMessage(interaction.message);
        await interaction.editReply("Готово.");

        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:setshort") {
        await interaction.reply("У вас есть **2 минуты**, чтобы написать сколько планируете уделять времени серверу.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            120_000
        );

        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120_000 })).first();
        if (!message) return;

        clearTimeout(timeout);
        const short = message.content;

        if (
            !short ||
            (short.length > 512 && short.length < 16)
        ) return await interaction.editReply("Длина ответа должна составлять от 16 до 512 символов.")
            .then(() => setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                message.delete().catch(() => null);
            }, 6_000));

        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");

        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        ticket.data.short = short;

        await ticket.save();

        await updateMessage(interaction.message);

        await interaction.editReply("Готово.");
        setTimeout(() => interaction.deleteReply().catch(() => null), 5_000);
    } else if (buttonId === "tickets:setlong") {
        const ticket = (await Ticket.findOne({ channel: interaction.channel!.id }))!;

        if (ticket.state !== 1) return await interaction.reply("Вы ещё не прошли первый этап. Подождите пока администрация одобрит Ваши ответы.")
            .then(() => setTimeout(() => interaction.deleteReply(), 5_000));

        await interaction.reply("У вас есть **10 минут**, чтобы написать краткое описание \"О себе\" и чем вы планируете заниматься на сервере.");
        let timeout = setTimeout(() =>
            interaction.editReply("Время вышло.").then(() => setTimeout(() => interaction.deleteReply().catch(() => null), 5_000)),
            600_000
        );

        const message = (await interaction.channel!.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 600_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const long = message.content;

        await interaction.editReply("Принято, обновляю в БД...");

        ticket.data.long = long;

        await ticket.save();

        await updateMessage(interaction.message);

        await interaction.editReply("Готово. (У вас есть 20 секунд, чтобы скопировать сообщение, в случае если хотите его ещё как-то дополнить.)");

        setTimeout(() => {
            interaction.deleteReply().catch(() => null);
            message.delete().catch(() => null);
        }, 20_000);
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
                name: "Планируемое время",
                value: `${ticket.data.short || "Пусто"}`
            }, {
                name: "Второй этап",
                value: `${ticket.data.long || "Пусто"}`
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