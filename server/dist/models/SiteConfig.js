import mongoose, { Schema } from 'mongoose';
const SiteConfigSchema = new Schema({
    avatar: { type: String, required: true },
    nickname: { type: String, required: true },
    bio: { type: String, required: true },
    socialLinks: {
        github: { type: String },
        email: { type: String },
        twitter: { type: String }
    }
});
export const SiteConfig = mongoose.model('SiteConfig', SiteConfigSchema);
//# sourceMappingURL=SiteConfig.js.map