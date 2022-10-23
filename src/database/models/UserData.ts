import { UserData } from "../../../types";
import mongoose from "mongoose";

export default mongoose.model("userdata", new mongoose.Schema<UserData>({
    user: "",
    nickname: "",
    registered: false,
    permissions: 0
}, { minimize: true }));