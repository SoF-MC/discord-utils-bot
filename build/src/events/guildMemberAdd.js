"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Util_1 = __importDefault(require("../util/Util"));
module.exports = async (member) => {
    if (member.guild.id !== "764178286233518100")
        return;
    if (!(await Util_1.default.mongoose.model("userdata").findOne({ user: member.id })))
        await Util_1.default.mongoose.model("userdata").create({ user: member.id, permissions: 0 });
    const channel = member.guild.channels.cache.get("764179432147124304");
    if (member.user.bot) {
        await member.roles.add([
            "764187012600954900",
            "784702019118039071"
        ]);
    }
    else {
        await member.roles.add([
            "790925095593443338",
            "764180408056414289"
        ]);
        await channel.send({
            content: `${member},`,
            embeds: [{
                    title: "Привет!",
                    description: `ъппъх! Ты присоединился к нам в гильдию. Теперь ты можешь пользоваться всеми приложениями на сервере.`,
                }]
        });
    }
    ;
};
