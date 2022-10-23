import config from "../../config";
import mongoose from "mongoose";

import Global from "./global";

export = {
    connection: mongoose.connect(config.database_uri),
    global: Global
};