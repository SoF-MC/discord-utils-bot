import { GuildMember, TextChannel } from "discord.js";

export = async (member: GuildMember) => {
    if (member.guild.id !== "764178286233518100") return;
    const channel = member.guild.channels.cache.get("764179432147124304") as TextChannel;

    if (member.user.bot) {
        await member.roles.add([
            "764187012600954900",       // Робот
            "784702019118039071"        // Бот Рэально
        ]);
    } else {
        await member.roles.add([
            "790925095593443338",       // spacer
            "764180408056414289"        // Гость
        ]);
        await channel.send({
            content: `${member},`,
            embeds: [{
                title: "Привет!",
                description: `Предисловие: Наконец появилась возможность добраться до интернета, сейчас мы находимся в Панамском канале и здесь есть wifi. Я на судне уже больше месяца и пока я здесь, я писал все интересное что здесь происходит и вот наконец есть возможность этим поделиться. Фотографий пока не будет, их я выложу или позже, или уже когда вернусь домой. Итак, понеслась:


                Первые впечатления

                Переночевав в гостинице в Гуаякиле, мы сели к агенту в машину и поехали на судно в Пуэрто Боливар. Доехали вопреки ожиданиям быстро, примерно за 3-4 часа. Погода была пасмурная и даже не смотря на то, что мы находимся недалеко от экватора, было прохладно. Почти все время, пока мы ехали, по обе стороны дороги были банановые плантации, но все равно в голове не укладывается: эти бананы грузят на суда в нескольких портах Эквадора десятками тысяч тонн каждый день, круглый год. Это ж несчастные бананы должны расти быстрее чем грибы.

                Дороги.
                Дороги в Эквадоре практически идеальные, хотя населенные пункты выглядят очень бедно. На дорогах много интересных машин, например очень много грузовиков - древних Фордов, которые я никогда раньше не видел. А еще несколько раз на глаза попадались старенькие Жигули :) А еще если кого-то обгоняешь и есть встречная машина, она обязательно включает фары. На больших машинах - грузовиках и автобусах, обязательно красуется местный тюнинг: машины разукрашенные, либо в наклейках, и обязательно везде огромное множество светодиодов, как будто новогодние елки едут и переливаются всеми цветами.

                Судно.
                На первый взгляд судно неплохое, в относительно хорошем состоянии, хотя и 92 года постройки. Экипаж 19 человек - 11 русских и 8 филиппинцев, включая повара. Говорят, периодически становится тоскливо от егошних кулинарных изысков. Филиппинцы здесь рядовой состав, за ними постоянно нужно следить чтобы не натворили чего, среди них только один матрос по-настоящему ответственный и с руками из нужного места, все понимает с полуслова. Остальные - типичные Равшаны да Джамшуты. А еще один из них - гомосек О___о, в добавок к этому он опасный человек, в том плане, что легко впадает в состояние ступора и отключает мозг: был случай как он закрыл одного матроса в трюме, тот орал и тарабанил внутри, это заметил боцман, начал орать на этого персонажа, который, в свою очередь испуганно выпучив глаза, трясущимися руками продолжал закручивать барашки. В итоге боцман его отодвинул и выпустил матроса из трюма. Общение на английском языке, но из-за акцента не всегда с первого раз понятно что филиппинцы говорят, особенно по рации. Напимер, говорит он тебе: Бикарпуль! Бикарпуль! А потом, когда уже поздно, выясняется что это было "Be careful!"

                Работа.
                Сразу, как только мы заселились, я не успел разложить вещи, как в мою голову ворвался такой поток информации, что ни в сказке сказать, ни топором не вырубить. Во-первых, на судне абсолютно все бумаги - мануалы, журналы, и так далее - все на английском языке. Даже блокнотик, в который записываются отчеты по грузовым операциям - и тот на английском. Бумаги... ооооо... Их тысячи, лежат в сотнях папок, плюс огромное количество документов на компьютерах. Это мне просто разорвало мозг в клочья, потому что с этим объемом информации надо ознакомиться и научиться работать в кротчайшие сроки. Постоянная беготня, постоянная суета, совсем не легко. А также надо как можно быстрее разобраться со всем оборудованием на мостике, а там его мама не горюй. В общем, пока что, свободного времени нет вообще. Абсолютно. Только ночью с 00:00 до 06:00 можно поспать. Но это продлится не долго, буквально 1-2 недели, потом океанский переход до Европы, можно будет уже спокойно стоять вахты, а в свободное время читать книги компании Seatrade, на случай если в Европе придет проверка и будет задавать вопросы.`
            }]
        });
    }
};