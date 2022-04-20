import config from "../../config";
import Util from "../util/Util";
import mongoose from "mongoose";
Util.setMongoose(mongoose);

import Global from "./global";

export = {
    connection: mongoose.connect(config.database_uri),
    global: Global,
    registerSchemas: () => {
        Util.mongoose.model("tickets", new mongoose.Schema({ user: "", channel: "", closed: false, data: {} } as any, { minimize: true }));
        Util.mongoose.model("userdata", new mongoose.Schema({ user: "", nickname: "", permissions: 0, ticketData: {} } as any, { minimize: true }));
    }
};