const mongoose = require("mongoose");

const dbCache = new Map();
const dbSaveQueue = new Map();

const globalObject = {
    nicknames: {}
};

const globalSchema = mongoose.Schema(globalObject, { minimize: true });
const Global = mongoose.model("Global", globalSchema);

const get = () => new Promise((resolve, reject) => Global.findOne({}, (err, global) => {
    if (err) return reject(err);
    if (!global) {
        global = new Global(globalObject);
    };
    return resolve(global);
}));

const load = async () => {
    let global = await get(), globalCache = {}, freshGuildObject = globalObject;
    for (const key in freshGuildObject) globalCache[key] = global[key] || freshGuildObject[key];
    return dbCache.set("global", globalCache);
};

const save = async (changes) => {
    dbSaveQueue.set("global", changes);
    let global = await get();
    const globalCache = dbCache.get("global");
    const globalSaveQueue = dbSaveQueue.get("global");

    for (const key of globalSaveQueue) global[key] = globalCache[key];

    return global.save().then(() => {
        let newSaveQueue = dbSaveQueue.get("global");
        if (newSaveQueue.length > globalSaveQueue.length) {
            dbSaveQueue.delete("global");
            save(newSaveQueue.filter(key => !globalSaveQueue.includes(key)));
        } else dbSaveQueue.delete("global");
    }).catch(console.log);
};

module.exports = {
    reload: () => load(),
    unload: () => dbCache.delete("global"),

    get: () => Object.assign({}, dbCache.get("global")),
    set: (key, value) => {
        dbCache.get("global")[key] = value;
        save([key]);
    },
    setMultiple: (changes) => {
        let globalCache = dbCache.get("global");
        Object.assign(globalCache, changes);

        save(Object.keys(changes));
    },
    addToArray: (array, value) => {
        dbCache.get("global")[array].push(value);
        save([array]);
    },
    removeFromArray: (array, value) => {
        dbCache.get("global")[array] = dbCache.get("global")[array].filter(aValue => aValue !== value);
        save([array]);
    },
    setOnObject: (object, key, value) => {
        dbCache.get("global")[object][key] = value;
        save([object]);
    },
    removeFromObject: (object, key) => {
        delete dbCache.get("global")[object][key];
        save([object]);
    },
    reset: () => {
        let globalCache = dbCache.get("global");
        Object.assign(globalCache, globalObject);

        save(Object.keys(globalObject));
    }
};