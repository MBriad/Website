import mongoose, { Schema, Document } from 'mongoose';

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
