"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const config_1 = __importDefault(require("../../config"));
const mongoose_1 = __importDefault(require("mongoose"));
const global_1 = __importDefault(require("./global"));
module.exports = {
    connection: mongoose_1.default.connect(config_1.default.database_uri),
    global: global_1.default
};
