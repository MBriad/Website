import mongoose, { Schema } from 'mongoose';
const ArticleSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    cover: { type: String },
    tags: [{ type: String }],
    category: { type: String, required: true },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Article = mongoose.model('Article', ArticleSchema);
//# sourceMappingURL=Article.js.map