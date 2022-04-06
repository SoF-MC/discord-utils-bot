"use strict";
const util_1 = require("util");
let util = null;
class Util {
    constructor() {
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
Util.inspect = util_1.inspect;
;
module.exports = new Util;
