import mongoose, { Schema, Document } from 'mongoose';

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

const PageBannerSchema = new Schema<IPageBanner>({
  pageId: { type: String, required: true, unique: true },
  src: { type: String, required: true },
  theme: { type: String, enum: ['light', 'dark', 'both'], default: 'both' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const SiteConfigSchema = new Schema<ISiteConfig>({
  avatar: { type: String, required: true },
  nickname: { type: String, required: true },
  bio: { type: String, required: true },
  socialLinks: {
    github: { type: String },
    email: { type: String },
    twitter: { type: String }
  }
});

export const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
export const PageBanner = mongoose.model<IPageBanner>('PageBanner', PageBannerSchema);
