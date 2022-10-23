import { Client } from "discord.js";
import { inspect } from "util";

let util: Util | null = null;

class Util {
    constructor() {
        if (util) return util;
        util = this;
    };

    private _client: Client;
    private _database: typeof import("../database/");
    public inspect = inspect;
    public clearMcColors = (str: string) => str.replace(/\u00A7[0-9A-FK-OR]/gi, "");

    public setClient(client: Client): Util {
        this._client = client;
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
        return require("mongoose");
    };
    get database() {
        return this._database;
    };
};

export = new Util;