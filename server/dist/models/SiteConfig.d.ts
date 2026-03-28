import mongoose, { Document } from 'mongoose';
export interface IPageBanner extends Document {
    pageId: string;
    src: string;
    theme: 'light' | 'dark' | 'both';
    active: boolean;
    order: number;
}
export interface ISiteConfig extends Document {
    avatar: string;
    nickname: string;
    bio: string;
    socialLinks: {
        github?: string;
        email?: string;
        twitter?: string;
    };
}
export declare const SiteConfig: mongoose.Model<ISiteConfig, {}, {}, {}, mongoose.Document<unknown, {}, ISiteConfig, {}, mongoose.DefaultSchemaOptions> & ISiteConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISiteConfig>;
export declare const PageBanner: mongoose.Model<IPageBanner, {}, {}, {}, mongoose.Document<unknown, {}, IPageBanner, {}, mongoose.DefaultSchemaOptions> & IPageBanner & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPageBanner>;
//# sourceMappingURL=SiteConfig.d.ts.map