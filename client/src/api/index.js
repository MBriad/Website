/**
 * @file src/api/index.js
 * @brief Axios 配置文件，封装所有 API 请求
 */

import axios from 'axios';

// 创建 Axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回数据，不需要每次都访问 response.data
    return response.data;
  },
  async (error) => {
    const config = error.config;
    
    // 429 错误自动重试
    if (error.response?.status === 429 && config && !config._retry) {
      config._retry = true;
      
      // 从响应头获取重试等待时间，默认 2 秒
      const retryAfter = error.response.headers['retry-after'] || 2;
      
      console.log(`Rate limited, retrying after ${retryAfter} seconds...`);
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      return api(config);
    }
    
    // 统一错误处理
    console.error('API Error:', error);
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      console.error(`Error ${status}:`, data);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('No response received:', error.request);
    } else {
      // 设置请求时发生错误
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 文章相关 API
 */
export const articleAPI = {
  getList: (params = {}) => api.get('/articles', { params }),
  getBySlug: (slug) => api.get(`/articles/${slug}`),
  getFeatured: () => api.get('/articles/featured'),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  remove: (id) => api.delete(`/articles/${id}`),
  getHeatmap: () => api.get('/articles/stats/heatmap'),
};

/**
 * 项目相关 API
 */
export const projectAPI = {
  getList: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getFeatured: () => api.get('/projects/featured'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
};

/**
 * 友链相关 API
 */
export const linkAPI = {
  getList: () => api.get('/links'),
  create: (data) => api.post('/links', data),
  update: (id, data) => api.put(`/links/${id}`, data),
  remove: (id) => api.delete(`/links/${id}`),
};

/**
 * 网站配置 API
 */
export const configAPI = {
  get: () => api.get('/config'),
  update: (data) => api.put('/config', data),
};

/**
 * 登录 API（管理员）
 */
export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
};

/**
 * 用户 API（普通注册用户）
 */
export const userAPI = {
  register: (username, email, password) => api.post('/register', { username, email, password }),
  login: (username, password) => api.post('/user-login', { username, password }),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

/**
 * 评论 API
 */
export const commentAPI = {
  getList: (articleId) => api.get(`/comments/${articleId}`),
  create: (articleId, content) => api.post('/comments', { articleId, content }),
  remove: (id) => api.delete(`/comments/${id}`),
};

/**
 * 音乐 API
 */
export const musicAPI = {
  getList: () => api.get('/music'),
  create: (data) => api.post('/music', data),
  update: (id, data) => api.put(`/music/${id}`, data),
  remove: (id) => api.delete(`/music/${id}`),
};

/**
 * 壁纸 API
 */
export const wallpaperAPI = {
  getList: () => api.get('/wallpapers'),
  getAll: () => api.get('/wallpapers/all'),
  create: (data) => api.post('/wallpapers', data),
  update: (id, data) => api.put(`/wallpapers/${id}`, data),
  remove: (id) => api.delete(`/wallpapers/${id}`),
};

/**
 * 上传 API
 */
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }
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

    // 并行获取文章和项目
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

export default api;
