import crypto from "crypto";

export const generateId = (length: number): string => {
    if (length < 1) return "";

    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
};

export const clearMcColors = (str: string) => str.replace(/\u00A7[0-9a-fk-or]/gi, "");