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
const articlesData = JSON.parse(
  readFileSync(join(__dirname, '../../../client/src/data/articles.json'), 'utf-8')
);

const projectsData = JSON.parse(
  readFileSync(join(__dirname, '../../../client/src/data/projects.json'), 'utf-8')
);

const linksData = JSON.parse(
  readFileSync(join(__dirname, '../../../client/src/data/links.json'), 'utf-8')
);

const siteConfigData = JSON.parse(
  readFileSync(join(__dirname, '../../../client/src/data/siteConfig.json'), 'utf-8')
);

async function seed() {
  try {
    await connectDatabase();
    
    // 清空现有数据
    await Article.deleteMany({});
    await Project.deleteMany({});
    await Link.deleteMany({});
    await SiteConfig.deleteMany({});
    
    // 导入数据
    const articlesWithContent = articlesData.articles.map((article: any) => ({
      ...article,
      content: article.content || article.excerpt, // 如果没有 content 字段，使用 excerpt
      published: article.published !== false, // 默认为 true
      featured: article.featured || false,
      createdAt: article.date ? new Date(article.date) : new Date(),
      updatedAt: new Date()
    }));
    await Article.insertMany(articlesWithContent);
    
    const projectsWithTechStack = projectsData.projects.map((project: any) => ({
      ...project,
      techStack: project.techStack || project.tech || [], // 兼容 tech 和 techStack 字段
      createdAt: new Date()
    }));
    await Project.insertMany(projectsWithTechStack);
    await Link.insertMany(linksData.links);
    await SiteConfig.create({
      ...siteConfigData,
      avatar: siteConfigData.avatar || '/avatar.jpg' // 如果没有 avatar 字段，使用默认值
    });
    
    console.log('✅ 数据迁移完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    process.exit(1);
  }
}

seed();
