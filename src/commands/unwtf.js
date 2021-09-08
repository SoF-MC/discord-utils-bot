module.exports = {
    description: "unwtf lol",
    usage: {},
    examples: {},
    aliases: [],
    permissionRequired: 0, // 0 All, 1 Admins, 2 Server Owner, 3 Bot Admin, 4 Bot Owner
    checkArgs: (args) => !!args.length
};

module.exports.run = async (message, args) => {
    let unwtfd = args.join(" ").toLowerCase()
        .replace(/q/g, "й")
        .replace(/w/g, "ц")
        .replace(/e/g, "у")
        .replace(/r/g, "к")
        .replace(/t/g, "е")
        .replace(/y/g, "н")
        .replace(/u/g, "г")
        .replace(/i/g, "ш")
        .replace(/o/g, "щ")
        .replace(/p/g, "з")
        .replace(/\[/g, "х")
        .replace(/\]/g, "ъ")
        .replace(/a/g, "ф")
        .replace(/s/g, "ы")
        .replace(/d/g, "в")
        .replace(/f/g, "а")
        .replace(/g/g, "п")
        .replace(/h/g, "р")
        .replace(/j/g, "о")
        .replace(/k/g, "л")
        .replace(/l/g, "д")
        .replace(/\;/g, "ж")
        .replace(/\'/g, "э")
        .replace(/z/g, "я")
        .replace(/x/g, "ч")
        .replace(/c/g, "с")
        .replace(/v/g, "м")
        .replace(/b/g, "и")
        .replace(/n/g, "т")
        .replace(/m/g, "ь")
        .replace(/\,/g, "б")
        .replace(/\./g, "ю")
        .replace(/\//g, ".")
        .replace(/\`/g, "ё");
    message.reply(unwtfd);
};