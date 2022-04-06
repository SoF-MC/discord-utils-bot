import { Client } from "discord.js";
import { inspect } from "util";

let util: Util | null = null;

class Util {
    constructor() {
        if (util) return util;
        util = this;
    };

    private _client: Client;
    private _mongoose: typeof import("mongoose");
    private _database: typeof import("../database/");
    public static inspect = inspect;

    public setClient(client: Client): Util {
        this._client = client;
        return this;
    };

    public setMongoose(mongoose: typeof import("mongoose")): Util {
        this._mongoose = mongoose;
        return this;
    };

    public setDatabase(database: typeof import("../database/")): Util {
        this._database = database;
        return this;
    };

    get client() {
        return this._client;
    };
    get mongoose() {
        return this._mongoose;
    };
    get database() {
        return this._database;
    };
};

export = new Util;