import mongoose, { Document } from 'mongoose';
export interface ILink extends Document {
    name: string;
    url: string;
    avatar?: string;
    description?: string;
    createdAt: Date;
}
export declare const Link: mongoose.Model<ILink, {}, {}, {}, mongoose.Document<unknown, {}, ILink, {}, mongoose.DefaultSchemaOptions> & ILink & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILink>;
//# sourceMappingURL=Link.d.ts.map