import { DocumentType, getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";

let state: 0 | 1 | 2 = 0;

@modelOptions({ schemaOptions: { collection: "userdatas" }, options: { allowMixed: Severity.ALLOW } })
class UserSchema {
    @prop({ type: String, required: true, unique: true }) user!: string;
    @prop({ type: String, default: "" }) nickname!: string;
    @prop({ type: Number, default: 0 }) permissions!: number;

    safeSave(this: UserDocument): void {
        if (state) return state = 2, void 0;

        state = 1;
        return void this.save().then(() => {
            if (state === 2) {
                state = 0;
                this.safeSave();
            } else state = 0;
        });
    };
};

export type UserDocument = DocumentType<UserSchema>;

export const User = getModelForClass(UserSchema);