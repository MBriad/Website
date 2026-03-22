import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  cover?: string;
  techStack: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  cover: { type: String },
  techStack: [{ type: String }],
  github: { type: String },
  demo: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
