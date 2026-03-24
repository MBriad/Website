/**
 * @file src/pages/Admin.jsx
 * @brief 管理后台页面（文章/项目/友链/配置 CRUD）
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { articleAPI, projectAPI, linkAPI, configAPI, uploadAPI } from '../api/index.js';
import Loading from '../components/Loading.jsx';

const TABS = [
  { key: 'articles', label: '文章' },
  { key: 'projects', label: '项目' },
  { key: 'links', label: '友链' },
  { key: 'config', label: '配置' },
];

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles');
  const [data, setData] = useState({ articles: [], projects: [], links: [], config: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [articles, projects, links, config] = await Promise.all([
        articleAPI.getList(),
        projectAPI.getList(),
        linkAPI.getList(),
        configAPI.get().catch(() => null),
      ]);
      setData({
        articles: articles.data || [],
        projects: projects || [],
        links: links || [],
        config,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      showError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleDelete = async (type, id) => {
    if (!confirm('确定删除？')) return;
    try {
      if (type === 'articles') await articleAPI.remove(id);
      else if (type === 'projects') await projectAPI.remove(id);
      else if (type === 'links') await linkAPI.remove(id);
      showMessage('删除成功');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.error || '删除失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="article-detail-container">
      <motion.div
        key="content"
        className="article-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="article-title" style={{ marginBottom: 0 }}>
            管理<span className="highlight-blue">后台</span>
          </h1>
          <button onClick={handleLogout} className="nav-button" style={{ padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
            退出登录
          </button>
        </div>

        {message && (
          <div style={{ padding: '10px 16px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(160, 216, 239, 0.2)', color: 'var(--text-ink)', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 16px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Tab 栏 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="tag-pill"
              style={{ border: 'none', cursor: 'pointer', fontWeight: activeTab === tab.key ? 600 : 400 }}
              {...(activeTab === tab.key ? { className: 'tag-pill tag-pill-active' } : {})}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 文章管理 */}
        {activeTab === 'articles' && (
          <ArticleTab
            articles={data.articles}
            onDelete={(id) => handleDelete('articles', id)}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 项目管理 */}
        {activeTab === 'projects' && (
          <ProjectTab
            projects={data.projects}
            onDelete={(id) => handleDelete('projects', id)}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 友链管理 */}
        {activeTab === 'links' && (
          <LinkTab
            links={data.links}
            onDelete={(id) => handleDelete('links', id)}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 配置管理 */}
        {activeTab === 'config' && (
          <ConfigTab
            config={data.config}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}
      </motion.div>
    </div>
  );
};

// ========== 文章 Tab ==========
const ArticleTab = ({ articles, onDelete, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', cover: '', category: '', tags: '', published: true, featured: false });
  const [uploading, setUploading] = useState(false);

  const startNew = () => {
    setForm({ title: '', slug: '', content: '', excerpt: '', cover: '', category: '', tags: '', published: true, featured: false });
    setEditing('new');
  };

  const startEdit = (article) => {
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      cover: article.cover || '',
      category: article.category,
      tags: article.tags.join(', '),
      published: article.published,
      featured: article.featured,
    });
    setEditing(article._id);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      setForm({ ...form, cover: res.url });
      showMessage('封面图片上传成功');
    } catch (err) {
      showError(err.response?.data?.error || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing === 'new') {
        await articleAPI.create(payload);
        showMessage('文章创建成功');
      } else {
        await articleAPI.update(editing, payload);
        showMessage('文章更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || '操作失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  if (editing) {
    return (
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '16px' }}>{editing === 'new' ? '新建文章' : '编辑文章'}</h3>
        <input style={inputStyle} placeholder="标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input style={inputStyle} placeholder="slug (URL标识)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
        <input style={inputStyle} placeholder="分类" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
        <input style={inputStyle} placeholder="标签 (逗号分隔)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <input style={inputStyle} placeholder="摘要" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} required />
        {/* 封面图片上传 */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>封面图片</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ fontSize: '0.85rem', marginBottom: '8px' }}
          />
          {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>上传中...</div>}
          {form.cover && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={form.cover} alt="封面预览" style={{ maxWidth: '120px', maxHeight: '80px', borderRadius: '6px', objectFit: 'cover' }} />
              <button type="button" onClick={() => setForm({ ...form, cover: '' })} style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#ff6b6b', background: 'none', border: 'none' }}>移除</button>
            </div>
          )}
        </div>
        <div data-color-mode="light" style={{ marginBottom: '12px' }}>
          <MDEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val || '' })}
            height={400}
            preview="live"
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} /> 已发布
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> 精选
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="nav-button" style={{ border: 'none', cursor: 'pointer' }}>保存</button>
          <button type="button" className="nav-button" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setEditing(null)}>取消</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <button onClick={startNew} className="nav-button" style={{ border: 'none', cursor: 'pointer', marginBottom: '16px' }}>+ 新建文章</button>
      {articles.map(a => (
        <div key={a._id} className="timeline-article" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{a.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{a.category} · {a.published ? '已发布' : '草稿'}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => startEdit(a)}>编辑</button>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#ff6b6b' }} onClick={() => onDelete(a._id)}>删除</button>
          </div>
        </div>
      ))}
      {articles.length === 0 && <div className="timeline-empty">暂无文章</div>}
    </>
  );
};

// ========== 项目 Tab ==========
const ProjectTab = ({ projects, onDelete, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', techStack: '', github: '', demo: '', featured: false });

  const startNew = () => {
    setForm({ title: '', description: '', techStack: '', github: '', demo: '', featured: false });
    setEditing('new');
  };

  const startEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(', '),
      github: project.github || '',
      demo: project.demo || '',
      featured: project.featured,
    });
    setEditing(project._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing === 'new') {
        await projectAPI.create(payload);
        showMessage('项目创建成功');
      } else {
        await projectAPI.update(editing, payload);
        showMessage('项目更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || '操作失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  if (editing) {
    return (
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '16px' }}>{editing === 'new' ? '新建项目' : '编辑项目'}</h3>
        <input style={inputStyle} placeholder="标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input style={inputStyle} placeholder="描述" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input style={inputStyle} placeholder="技术栈 (逗号分隔)" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} />
        <input style={inputStyle} placeholder="GitHub 链接" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
        <input style={inputStyle} placeholder="Demo 链接" value={form.demo} onChange={e => setForm({ ...form, demo: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> 精选
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="nav-button" style={{ border: 'none', cursor: 'pointer' }}>保存</button>
          <button type="button" className="nav-button" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setEditing(null)}>取消</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <button onClick={startNew} className="nav-button" style={{ border: 'none', cursor: 'pointer', marginBottom: '16px' }}>+ 新建项目</button>
      {projects.map(p => (
        <div key={p._id} className="timeline-article" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{p.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.techStack.join(', ')}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => startEdit(p)}>编辑</button>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#ff6b6b' }} onClick={() => onDelete(p._id)}>删除</button>
          </div>
        </div>
      ))}
      {projects.length === 0 && <div className="timeline-empty">暂无项目</div>}
    </>
  );
};

// ========== 友链 Tab ==========
const LinkTab = ({ links, onDelete, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', avatar: '', description: '' });

  const startNew = () => {
    setForm({ name: '', url: '', avatar: '', description: '' });
    setEditing('new');
  };

  const startEdit = (link) => {
    setForm({ name: link.name, url: link.url, avatar: link.avatar || '', description: link.description || '' });
    setEditing(link._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await linkAPI.create(form);
        showMessage('友链创建成功');
      } else {
        await linkAPI.update(editing, form);
        showMessage('友链更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || '操作失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  if (editing) {
    return (
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '16px' }}>{editing === 'new' ? '新建友链' : '编辑友链'}</h3>
        <input style={inputStyle} placeholder="名称" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input style={inputStyle} placeholder="链接 URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required />
        <input style={inputStyle} placeholder="头像 URL" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
        <input style={inputStyle} placeholder="描述" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="nav-button" style={{ border: 'none', cursor: 'pointer' }}>保存</button>
          <button type="button" className="nav-button" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setEditing(null)}>取消</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <button onClick={startNew} className="nav-button" style={{ border: 'none', cursor: 'pointer', marginBottom: '16px' }}>+ 新建友链</button>
      {links.map(l => (
        <div key={l._id} className="timeline-article" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{l.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{l.url}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => startEdit(l)}>编辑</button>
            <button className="tag-pill" style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#ff6b6b' }} onClick={() => onDelete(l._id)}>删除</button>
          </div>
        </div>
      ))}
      {links.length === 0 && <div className="timeline-empty">暂无友链</div>}
    </>
  );
};

// ========== 配置 Tab ==========
const ConfigTab = ({ config, onRefresh, showMessage, setError }) => {
  const [form, setForm] = useState({
    avatar: config?.avatar || '',
    nickname: config?.nickname || '',
    bio: config?.bio || '',
    github: config?.socialLinks?.github || '',
    email: config?.socialLinks?.email || '',
    twitter: config?.socialLinks?.twitter || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await configAPI.update({
        avatar: form.avatar,
        nickname: form.nickname,
        bio: form.bio,
        socialLinks: { github: form.github, email: form.email, twitter: form.twitter },
      });
      showMessage('配置更新成功');
      onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || '更新失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  return (
    <form onSubmit={handleSubmit}>
      <input style={inputStyle} placeholder="头像 URL" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
      <input style={inputStyle} placeholder="昵称" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} required />
      <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="个人简介" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} required />
      <input style={inputStyle} placeholder="GitHub 链接" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
      <input style={inputStyle} placeholder="邮箱 (mailto:xxx)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input style={inputStyle} placeholder="Twitter 链接" value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} />
      <button type="submit" className="nav-button" style={{ border: 'none', cursor: 'pointer' }}>保存配置</button>
    </form>
  );
};

export default Admin;
