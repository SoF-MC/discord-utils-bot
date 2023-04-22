import { DocumentType, getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { collection: "userdatas" }, options: { allowMixed: Severity.ALLOW } })
class UserSchema {
    @prop({ type: String, required: true, unique: true }) user!: string;
    @prop({ type: String, default: "" }) nickname!: string;
    @prop({ type: Number, default: 0 }) permissions!: number;
    @prop({ type: Boolean, default: false }) registered!: boolean;
};

export type UserDocument = DocumentType<UserSchema>;

export const User = getModelForClass(UserSchema);