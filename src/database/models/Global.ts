import { DocumentType, getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { collection: "globals" }, options: { allowMixed: Severity.ALLOW } })
class GlobalSchema {
    @prop({ type: String, default: "" }) ticketMessage!: string;
    @prop({ type: Boolean, default: false }) ticketsEnabled!: boolean;
};

export type GlobalDocument = DocumentType<GlobalSchema>;

export const Global = getModelForClass(GlobalSchema);