import mongoose, { Schema } from 'mongoose';
const PageBannerSchema = new Schema({
    pageId: { type: String, required: true, unique: true },
    src: { type: String, required: true },
    theme: { type: String, enum: ['light', 'dark', 'both'], default: 'both' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});
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
export const PageBanner = mongoose.model('PageBanner', PageBannerSchema);
//# sourceMappingURL=SiteConfig.js.map