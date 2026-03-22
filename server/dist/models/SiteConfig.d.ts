import mongoose, { Document } from 'mongoose';
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
//# sourceMappingURL=SiteConfig.d.ts.map