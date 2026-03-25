import mongoose, { Schema, Document } from 'mongoose';

export interface IWallpaper extends Document {
  src: string;
  theme: 'light' | 'dark' | 'both';
  order: number;
  active: boolean;
  createdAt: Date;
}

const WallpaperSchema = new Schema<IWallpaper>({
  src: { type: String, required: true },
  theme: { type: String, enum: ['light', 'dark', 'both'], default: 'both' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

WallpaperSchema.index({ active: 1, order: 1 });

export const Wallpaper = mongoose.model<IWallpaper>('Wallpaper', WallpaperSchema);
