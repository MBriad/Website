import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
