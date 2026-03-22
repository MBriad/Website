import mongoose, { Document } from 'mongoose';
export interface IArticle extends Document {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover?: string;
    tags: string[];
    category: string;
    published: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Article: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, mongoose.DefaultSchemaOptions> & IArticle & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IArticle>;
//# sourceMappingURL=Article.d.ts.map