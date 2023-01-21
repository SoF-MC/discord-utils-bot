import mongoose from "mongoose";
import config from "../config";

export * from "./global";
export * from "./user";

export * from "./models/Global";
export * from "./models/Ticket";
export * from "./models/User";

export const connection = mongoose.connect(config.databaseUri);