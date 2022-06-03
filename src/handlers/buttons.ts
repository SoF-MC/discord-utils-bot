import { ButtonInteraction, Message, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import { TicketObject, UserData } from "../../types";
import Util from "../util/Util";

export const processButton = async (interaction: ButtonInteraction) => {
    if (interaction.channel.type !== "GUILD_TEXT") return;
    const buttonId = interaction.customId;
    const ticketsModel = Util.mongoose.model("tickets");

    if (buttonId === "tickets:create") {
        const ticket = await ticketsModel.findOne({ user: interaction.user.id });
        if (![
            "419892040726347776",       // djoh
            "684472142804549637",       // padow
            "602492362136092720",       // vladirus
            "525748937349529602"        // srit
        ].includes(interaction.user.id)) return await interaction.reply({
            content: "пошёл нахуй",
            ephemeral: true
        });
        if (!ticket) {
            await interaction.reply({
                content: "Создаю канал...",
                ephemeral: true
            });
            const channel = await interaction.guild.channels.create(`ticket-${interaction.user.tag}`, {
                permissionOverwrites: [{
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"],
                }],
                rateLimitPerUser: 2,
                parent: "962401942670282773"
            }) as TextChannel;
            await interaction.editReply("Канал создан, создаю записи в БД...");
            await ticketsModel.create({ user: interaction.user.id, channel: channel.id });
            await interaction.editReply("Почти готово...");
            await channel.permissionOverwrites.create(interaction.user, { VIEW_CHANNEL: true });
            const originalMessage = await channel.send({
                content: "Нажимайте на кнопки ниже чтобы заполнить заявку.",
                components: [
                    new MessageActionRow().addComponents([
                        new MessageButton().setLabel("user:").setCustomId("dummy_g2HVZR").setStyle("SECONDARY").setDisabled(true),
                        new MessageButton().setLabel("Первый вопрос").setCustomId("tickets:setnick").setStyle("PRIMARY"),
                        new MessageButton().setLabel("Второй вопрос").setCustomId("tickets:setage").setStyle("PRIMARY"),
                        new MessageButton().setLabel("Третий вопрос").setCustomId("tickets:setshort").setStyle("PRIMARY"),
                        new MessageButton().setLabel("Второй этап").setCustomId("tickets:setlong").setStyle("PRIMARY"),
                    ]),
                    new MessageActionRow().addComponents([
                        new MessageButton().setLabel("admin:").setCustomId("dummy_U4Fr8y").setStyle("SECONDARY").setDisabled(true),
                        new MessageButton().setLabel("Принять").setCustomId("tickets:accept").setStyle("SUCCESS"),
                        new MessageButton().setLabel("Закрыть").setCustomId("tickets:close").setStyle("DANGER")
                    ])
                ]
            });
            await ticketsModel.findOneAndUpdate({ user: interaction.user.id }, { $set: { originalMessage: originalMessage.id } });
            await interaction.editReply("Готово!");
        } else await interaction.reply({
            content: "У вас уже есть заявка",
            ephemeral: true
        });
    } else if (buttonId === "tickets:reopen") {
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject;
        await (interaction.message as Message).delete().catch(() => null);
        await interaction.channel.permissionOverwrites.create(ticket.user, { VIEW_CHANNEL: true });
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { closed: false } });
    } else if (buttonId === "tickets:close") {
        if (
            ((await Util.mongoose.model("userdata").findOne({ user: interaction.user.id })).toJSON() as any as UserData).permissions < 2
        ) return;
        const ticket = await ticketsModel.findOne({ channel: interaction.channel.id });
        await interaction.channel.permissionOverwrites.delete((ticket.toJSON() as any).user);
        await interaction.channel.send({
            content: "ну чё обсуждайте хуле",
            components: [new MessageActionRow().addComponents([
                new MessageButton().setLabel("открыть обратно").setCustomId("tickets:reopen").setStyle("SUCCESS"),
                new MessageButton().setLabel("удалить нахуй").setCustomId("tickets:delete").setStyle("DANGER")
            ])]
        });
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { closed: true } });
    } else if (buttonId === "tickets:accept") {
        const ticket = (await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject;
        if (ticket.state === 0) {
            await interaction.editReply("WIP");
            return;
        } else if (ticket.state === 1) {
            await interaction.editReply("WIP");
            return;
        };
    } else if (buttonId === "tickets:delete") {
        await ticketsModel.findOneAndDelete({ channel: interaction.channel.id });
        await interaction.channel.delete();
    } else if (buttonId === "tickets:setnick") {
        await interaction.reply("У вас есть **30 секунд**, чтобы написать свой никнейм в этом канале.");
        let timeout = setTimeout(async () =>
            await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5_000)),
            30_000
        );
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 30_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const nick = message.content?.match(/^[a-zA-Z0-9_]{2,16}$/mg)?.[0];
        if (
            !nick ||
            nick.length !== message.content.length
        ) return await interaction.editReply("Никнейм должен состоять из латинских букв и цифр, не менее 2 и не более 16 символов.")
            .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 5_000));
        await message.delete().catch(() => null);
        await interaction.editReply("Никнейм принят, обновляю в БД...");
        let { data } = ((await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject);
        if (!data) data = {};
        data.nickname = nick;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message as Message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4_000);
    } else if (buttonId === "tickets:setage") {
        await interaction.reply("У вас есть **10 секунд**, чтобы написать свой возраст в этом канале.");
        let timeout = setTimeout(async () =>
            await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5_000)),
            12_000
        );
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 10_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        let age = message.content?.match(/^[0-9]{2}$/mg)?.[0];
        if (
            !age ||
            age.length !== message.content.length
        ) return await interaction.editReply("Возраст должен состоять из цифр, не менее и не более 2 символов.")
            .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 6_000));
        await message.delete().catch(() => null);
        await interaction.editReply("Возраст принят, обновляю в БД...");
        let { data } = ((await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject);
        if (!data) data = {};
        data.age = parseInt(age);
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message as Message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4_000);
    } else if (buttonId === "tickets:setshort") {
        await interaction.reply("У вас есть **2 минуты**, чтобы написать сколько планируете уделять времени серверу.");
        let timeout = setTimeout(async () =>
            await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5_000)),
            122_000
        );
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const short = message.content;
        if (
            !short ||
            (short.length > 512 && short.length < 16)
        ) return await interaction.editReply("Длина ответа должна составлять от 16 до 512 символов.")
            .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 6_000));
        await message.delete().catch(() => null);
        await interaction.editReply("Принято, обновляю в БД...");
        let { data } = ((await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject);
        if (!data) data = {};
        data.short = short;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message as Message);
        await interaction.editReply("Готово.");
        setTimeout(async () => await interaction.deleteReply().catch(() => null), 4_000);
    } else if (buttonId === "tickets:setlong") {
        await interaction.reply("У вас есть **2 минуты**, чтобы написать сколько планируете уделять времени серверу.");
        let timeout = setTimeout(async () =>
            await interaction.editReply("Время вышло.").then(async () => setTimeout(async () => await interaction.deleteReply().catch(() => null), 5_000)),
            122_000
        );
        const message = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 120_000 })).first();
        if (!message) return;
        clearTimeout(timeout);
        const long = message.content;
        if (
            !long ||
            (long.length > 512 && long.length < 16)
        ) return await interaction.editReply("Длина ответа должна составлять от 16 до 512 символов.")
            .then(() => setTimeout(async () => {
                await interaction.deleteReply().catch(() => null);
                await message.delete().catch(() => null);
            }, 6_000));
        await interaction.editReply("Принято, обновляю в БД...");
        let { data } = ((await ticketsModel.findOne({ channel: interaction.channel.id })).toJSON() as any as TicketObject);
        if (!data) data = {};
        data.long = long;
        await ticketsModel.findOneAndUpdate({ channel: interaction.channel.id }, { $set: { data } });
        await updateMessage(interaction.message as Message);
        await interaction.editReply("Готово. (У вас есть 20 секунд, чтобы скопировать сообщение, в случае если хотите его ещё как-то дополнить.)");
        setTimeout(async () => {
            await interaction.deleteReply().catch(() => null);
            await message.delete().catch(() => null);
        }, 20_000);
    };

    async function updateMessage(message: Message) {
        const ticket = ((await ticketsModel.findOne({ channel: message.channel.id })).toJSON() as any as TicketObject);

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
    };
};