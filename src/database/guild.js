const mongoose = require("mongoose");

const dbCache = new Map(), dbSaveQueue = new Map();

const guildObject = {
    guildId: ""
};

const guildSchema = mongoose.Schema(guildObject, { minimize: true }); // make a copy of guildObject
const Guild = mongoose.model("Guild", guildSchema);

const get = (guildId) => new Promise((resolve, reject) => Guild.findOne({ guildId }, (err, guild) => {
    if (err) return reject(err);
    if (!guild) {
        guild = new Guild(guildObject);
        guild.guildId = guildId;
    };
    return resolve(guild);
}));

const load = async (guildId) => {
    let guild = await get(guildId), guildCache = {}, freshGuildObject = guildObject;
    for (const key in freshGuildObject) guildCache[key] = guild[key] || freshGuildObject[key];
    return dbCache.set(guildId, guildCache);
};

const save = async (guildId, changes) => {
    if (!dbSaveQueue.has(guildId)) {
        dbSaveQueue.set(guildId, changes);
        let guild = await get(guildId);
        let guildCache = dbCache.get(guildId);
        let guildSaveQueue = dbSaveQueue.get(guildId);

        for (const key of guildSaveQueue) guild[key] = guildCache[key];
        return guild.save().then(() => {
            let newSaveQueue = dbSaveQueue.get(guildId);
            if (newSaveQueue.length > guildSaveQueue.length) {
                dbSaveQueue.delete(guildId);
                save(guildId, newSaveQueue.filter(key => !guildSaveQueue.includes(key)));
            } else dbSaveQueue.delete(guildId);
        }).catch(console.log);
    } else dbSaveQueue.get(guildId).push(...changes);
};

module.exports = () => (async guildId => {
    if (!dbCache.has(guildId)) await load(guildId);
    return {
        reload: () => load(guildId),
        unload: () => dbCache.delete(guildId),

        get: () => Object.assign({}, dbCache.get(guildId)),
        set: (key, value) => {
            dbCache.get(guildId)[key] = value;
            save(guildId, [key]);
        },
        setMultiple: (changes) => {
            let guildCache = dbCache.get(guildId);
            Object.assign(guildCache, changes);

            save(guildId, Object.keys(changes));
        },
        addToArray: (array, value) => {
            dbCache.get(guildId)[array].push(value);
            save(guildId, [array]);
        },
        removeFromArray: (array, value) => {
            dbCache.get(guildId)[array] = dbCache.get(guildId)[array].filter(aValue => aValue !== value);
            save(guildId, [array]);
        },
        setOnObject: (object, key, value) => {
            dbCache.get(guildId)[object][key] = value;
            save(guildId, [object]);
        },
        removeFromObject: (object, key) => {
            delete dbCache.get(guildId)[object][key];
            save(guildId, [object]);
        },
        reset: () => {
            let guildCache = dbCache.get(guildId);
            Object.assign(guildCache, guildObject);
            guildCache.guildId = guildId;

            save(guildId, Object.keys(guildObject));
        }
    };
});

module.exports.cacheAll = async (guilds = new Set()) => {
    let gdbs = await Guild.find({ $or: [...guilds].map(guildId => ({ guildId })) });
    return await Promise.all([...guilds].map(async guildId => {
        let guild = gdbs.find(db => db.guildId == guildId) || { guildId };
        let guildCache = {};
        let freshGuildObject = guildObject;
        for (const key in freshGuildObject) guildCache[key] = guild[key] || freshGuildObject[key];
        return dbCache.set(guildId, guildCache);
    }));
};