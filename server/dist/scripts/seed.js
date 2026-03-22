import { connectDatabase } from '../config/database.js';
import { Article } from '../models/Article.js';
import { Project } from '../models/Project.js';
import { Link } from '../models/Link.js';
import { SiteConfig } from '../models/SiteConfig.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 从 JSON 文件导入数据
const articlesData = JSON.parse(readFileSync(join(__dirname, '../../../client/src/data/articles.json'), 'utf-8'));
const projectsData = JSON.parse(readFileSync(join(__dirname, '../../../client/src/data/projects.json'), 'utf-8'));
const linksData = JSON.parse(readFileSync(join(__dirname, '../../../client/src/data/links.json'), 'utf-8'));
const siteConfigData = JSON.parse(readFileSync(join(__dirname, '../../../client/src/data/siteConfig.json'), 'utf-8'));
async function seed() {
    try {
        await connectDatabase();
        // 清空现有数据
        await Article.deleteMany({});
        await Project.deleteMany({});
        await Link.deleteMany({});
        await SiteConfig.deleteMany({});
        // 导入数据
        await Article.insertMany(articlesData.articles);
        await Project.insertMany(projectsData.projects);
        await Link.insertMany(linksData.links);
        await SiteConfig.create(siteConfigData);
        console.log('✅ 数据迁移完成');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ 数据迁移失败:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map