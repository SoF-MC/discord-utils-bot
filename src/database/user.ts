import { User, UserDocument } from "./models/User";

export async function getUserDocument(userId: string): Promise<UserDocument> {
    return await User.findOne({ user: userId }) ?? new User();
};