import { TicketObject } from "../../../types";
import mongoose from "mongoose";

export default mongoose.model("tickets", new mongoose.Schema<TicketObject>({
    user: "",
    channel: "",
    state: 0,
    closed: false,
    data: {}
}));