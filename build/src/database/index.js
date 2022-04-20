"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const config_1 = __importDefault(require("../../config"));
const Util_1 = __importDefault(require("../util/Util"));
const mongoose_1 = __importDefault(require("mongoose"));
Util_1.default.setMongoose(mongoose_1.default);
const global_1 = __importDefault(require("./global"));
module.exports = {
    connection: mongoose_1.default.connect(config_1.default.database_uri),
    global: global_1.default,
    registerSchemas: () => {
        Util_1.default.mongoose.model("tickets", new mongoose_1.default.Schema({ user: "", channel: "", closed: false, data: {} }, { minimize: true }));
        Util_1.default.mongoose.model("userdata", new mongoose_1.default.Schema({ user: "", nickname: "", permissions: 0, ticketData: {} }, { minimize: true }));
    }
};
