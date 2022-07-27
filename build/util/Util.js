"use strict";
const util_1 = require("util");
let util = null;
class Util {
    constructor() {
        this.inspect = util_1.inspect;
        this.clearMcColors = (str) => str.replace(/\u00A7[0-9A-FK-OR]/gi, "");
        if (util)
            return util;
        util = this;
    }
    ;
    setClient(client) {
        this._client = client;
        return this;
    }
    ;
    setMongoose(mongoose) {
        this._mongoose = mongoose;
        return this;
    }
    ;
    setDatabase(database) {
        this._database = database;
        return this;
    }
    ;
    get client() {
        return this._client;
    }
    ;
    get mongoose() {
        return this._mongoose;
    }
    ;
    get database() {
        return this._database;
    }
    ;
}
;
module.exports = new Util;
