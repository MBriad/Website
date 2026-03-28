import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    cover: { type: String },
    category: { type: String },
    techStack: [{ type: String }],
    github: { type: String },
    demo: { type: String },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
export const Project = mongoose.model('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map