import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink extends Document {
  name: string;
  url: string;
  icon: string;
  order: number;
  active: boolean;
}

const SocialLinkSchema = new Schema<ISocialLink>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

export const SocialLink = mongoose.model<ISocialLink>('SocialLink', SocialLinkSchema);