import mongoose, { Schema, Document } from 'mongoose';

export interface IMusic extends Document {
  title: string;
  artist: string;
  src: string;
  cover?: string;
  order: number;
  createdAt: Date;
}

const MusicSchema = new Schema<IMusic>({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  src: { type: String, required: true },
  cover: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

MusicSchema.index({ order: 1 });

export const Music = mongoose.model<IMusic>('Music', MusicSchema);
