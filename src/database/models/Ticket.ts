import { DocumentType, getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
class TicketDataSchema {
    @prop({ type: String, default: "" }) nickname!: string;
    @prop({ type: Number, default: 0 }) age!: number;
    @prop({ type: String, default: "" }) short!: string;
    @prop({ type: String, default: "" }) long!: string;
};

@modelOptions({ schemaOptions: { collection: "tickets" }, options: { allowMixed: Severity.ALLOW } })
class TicketSchema {
    @prop({ type: String, required: true, unique: true }) user!: string;
    @prop({ type: String, required: true, unique: true }) channel!: string;
    @prop({ type: Number, default: 0 }) state!: 0 | 1 | 2;
    @prop({ type: Boolean, default: false }) closed!: boolean;
    @prop({ type: TicketDataSchema, default: {} }) data!: TicketDataSchema;
};

export type TicketDocument = DocumentType<TicketSchema>;

export const Ticket = getModelForClass(TicketSchema);
