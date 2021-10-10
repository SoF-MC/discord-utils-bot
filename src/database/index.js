const config = require("../../config"), mongoose = require("mongoose");

module.exports.guild = require("./guild")();
module.exports.cacheGuilds = require("./guild").cacheAll;
module.exports.global = require("./global");

module.exports.connection = mongoose.connect(config.database_uri, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
});
