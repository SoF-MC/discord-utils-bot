import { DocumentType, getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";

let state: 0 | 1 | 2 = 0;

@modelOptions({ schemaOptions: { collection: "globals" }, options: { allowMixed: Severity.ALLOW } })
class GlobalSchema {
    @prop({ type: String, default: "" }) ticketMessage!: string;
    @prop({ type: Boolean, default: false }) ticketsEnabled!: boolean;

    safeSave(this: GlobalDocument): void {
        if (state) return (state = 2), void 0;

        state = 1;
        return void this.save().then(() => {
            if (state === 2) {
                state = 0;
                this.safeSave();
            } else state = 0;
        });
    }
}

export type GlobalDocument = DocumentType<GlobalSchema>;

export const Global = getModelForClass(GlobalSchema);
