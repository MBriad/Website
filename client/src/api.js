/**
 * @file src/api.js
 * @brief API 服务层，统一管理所有后端 API 调用
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 通用 fetch 封装
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 文章相关 API
 */
export const articleAPI = {
  // 获取文章列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/articles${query ? `?${query}` : ''}`);
  },

  // 获取单篇文章
  getBySlug: (slug) => {
    return fetchAPI(`/api/articles/${slug}`);
  },

  // 获取精选文章
  getFeatured: () => {
    return fetchAPI('/api/articles/featured');
  },
};

/**
 * 项目相关 API
 */
export const projectAPI = {
  // 获取项目列表
  getList: () => {
    return fetchAPI('/api/projects');
  },

  // 获取单个项目
  getById: (id) => {
    return fetchAPI(`/api/projects/${id}`);
  },

  // 获取精选项目
  getFeatured: () => {
    return fetchAPI('/api/projects/featured');
  },
};

/**
 * 友链相关 API
 */
export const linkAPI = {
  // 获取友链列表
  getList: () => {
    return fetchAPI('/api/links');
  },
};

/**
 * 网站配置 API
 */
export const configAPI = {
  // 获取网站配置
  get: () => {
    return fetchAPI('/api/config');
  },
};

/**
 * 搜索 API（本地过滤）
 */
export const searchAPI = {
  // 搜索文章和项目
  search: async (query) => {
    if (!query.trim()) {
      return { articles: [], projects: [] };
    }

    const q = query.toLowerCase();

    // 获取所有文章和项目
    const [articlesRes, projectsRes] = await Promise.all([
      articleAPI.getList(),
      projectAPI.getList(),
    ]);

    // 过滤文章
    const articles = (articlesRes.data || []).filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );

    // 过滤项目
    const projects = (projectsRes || []).filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
    );

    return { articles, projects };
  },
};

export default {
  article: articleAPI,
  project: projectAPI,
  link: linkAPI,
  config: configAPI,
  search: searchAPI,
};
