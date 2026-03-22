import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  name: string;
  url: string;
  avatar?: string;
  description?: string;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  avatar: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Link = mongoose.model<ILink>('Link', LinkSchema);
