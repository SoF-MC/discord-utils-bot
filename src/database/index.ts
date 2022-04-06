import config from "../../config";
import Util from "../util/Util";
import mongoose from "mongoose";
Util.setMongoose(mongoose);

import Global from "./global";

export = {
    connection: mongoose.connect(config.database_uri),
    global: Global
};