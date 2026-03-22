import mongoose, { Schema } from 'mongoose';
const LinkSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    avatar: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});
export const Link = mongoose.model('Link', LinkSchema);
//# sourceMappingURL=Link.js.map