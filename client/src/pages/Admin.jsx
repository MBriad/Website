/**
 * @file src/pages/Admin.jsx
 * @brief 管理后台页面（文章/项目/友链/配置 CRUD）
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { articleAPI, projectAPI, linkAPI, configAPI, uploadAPI, musicAPI, wallpaperAPI, bannerAPI, socialLinkAPI } from '../api/index.js';
import Loading from '../components/Loading.jsx';

const TABS = [
  { key: 'articles', label: '文章' },
  { key: 'projects', label: '项目' },
  { key: 'links', label: '友链' },
  { key: 'music', label: '音乐' },
  { key: 'wallpapers', label: '壁纸' },
  { key: 'banners', label: '页面横幅' },
  { key: 'socialLinks', label: '社交链接' },
  { key: 'config', label: '配置' },
];

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles');
  const [data, setData] = useState({ articles: [], projects: [], links: [], music: [], wallpapers: [], banners: [], socialLinks: [], config: null });
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
      const [articles, projects, links, music, wallpapers, banners, socialLinks, config] = await Promise.all([
        articleAPI.getList(),
        projectAPI.getList(),
        linkAPI.getList(),
        musicAPI.getList().catch(() => []),
        wallpaperAPI.getAll().catch(() => []),
        bannerAPI.getAll().catch(() => []),
        socialLinkAPI.getAll().catch(() => []),
        configAPI.get().catch(() => null),
      ]);
      setData({
        articles: articles.data || [],
        projects: projects || [],
        links: links || [],
        music: music || [],
        wallpapers: wallpapers || [],
        banners: banners || [],
        socialLinks: socialLinks || [],
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
      else if (type === 'music') await musicAPI.remove(id);
      else if (type === 'wallpapers') await wallpaperAPI.remove(id);
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

        {/* 音乐管理 */}
        {activeTab === 'music' && (
          <MusicTab
            music={data.music}
            onDelete={(id) => handleDelete('music', id)}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 壁纸管理 */}
        {activeTab === 'wallpapers' && (
          <WallpaperTab
            wallpapers={data.wallpapers}
            onDelete={(id) => handleDelete('wallpapers', id)}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 页面横幅管理 */}
        {activeTab === 'banners' && (
          <BannerTab
            banners={data.banners}
            onRefresh={fetchData}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {/* 社交链接管理 */}
        {activeTab === 'socialLinks' && (
          <SocialLinkTab
            links={data.socialLinks}
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
  const [form, setForm] = useState({ title: '', description: '', cover: '', category: '', techStack: '', github: '', demo: '', featured: false });
  const [uploading, setUploading] = useState(false);

  const startNew = () => {
    setForm({ title: '', description: '', cover: '', category: '', techStack: '', github: '', demo: '', featured: false });
    setEditing('new');
  };

  const startEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description,
      cover: project.cover || '',
      category: project.category || '',
      techStack: project.techStack.join(', '),
      github: project.github || '',
      demo: project.demo || '',
      featured: project.featured,
    });
    setEditing(project._id);
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
      setError(err.response?.data?.error || '上传失败');
    } finally {
      setUploading(false);
    }
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
        
        {/* 封面图片上传 */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>封面图片（横向 6:4 效果最佳）</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ fontSize: '0.85rem', marginBottom: '8px' }} />
          {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>上传中...</div>}
          {form.cover && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={form.cover} alt="封面预览" style={{ maxWidth: '200px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
              <button type="button" onClick={() => setForm({ ...form, cover: '' })} style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#ff6b6b', background: 'none', border: 'none' }}>移除</button>
            </div>
          )}
        </div>

        <input style={inputStyle} placeholder="分类" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
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

// ========== 音乐管理 Tab ==========
const MusicTab = ({ music, onDelete, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', artist: '', src: '', cover: '', order: 0 });

  const startAdd = () => {
    setEditing('new');
    setForm({ title: '', artist: '', src: '', cover: '', order: music.length });
  };

  const startEdit = (m) => {
    setEditing(m._id);
    setForm({ title: m.title, artist: m.artist, src: m.src, cover: m.cover || '', order: m.order || 0 });
  };

  const handleFileUpload = async (file, field) => {
    try {
      const res = await uploadAPI.uploadImage(file);
      setForm({ ...form, [field]: res.url });
      showMessage(`${field === 'cover' ? '封面' : '音频'}上传成功`);
    } catch (err) {
      setError(err.response?.data?.error || '上传失败');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await musicAPI.create(form);
        showMessage('添加成功');
      } else {
        await musicAPI.update(editing, form);
        showMessage('更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>音乐列表 ({music.length})</h3>
        <button onClick={startAdd} className="nav-button" style={{ padding: '6px 14px', border: 'none', cursor: 'pointer' }}>
          + 添加音乐
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(160,216,239,0.05)', borderRadius: '12px' }}>
          <input style={inputStyle} placeholder="歌曲标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input style={inputStyle} placeholder="艺术家" value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} required />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>FLAC 音频文件</label>
            <input type="file" accept=".flac,audio/flac" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], 'src')} style={{ fontSize: '0.85rem' }} />
            {form.src && <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '4px' }}>{form.src.split('/').pop()}</div>}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>封面图（可选）</label>
            <input type="file" accept="image/*" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], 'cover')} style={{ fontSize: '0.85rem' }} />
            {form.cover && <img src={form.cover} alt="封面预览" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginTop: '4px' }} />}
          </div>
          <input style={inputStyle} type="number" placeholder="排序" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="nav-button" style={{ padding: '6px 14px', border: 'none', cursor: 'pointer' }}>{editing === 'new' ? '添加' : '保存'}</button>
            <button type="button" onClick={() => setEditing(null)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}>取消</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {music.map((m) => (
          <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px' }}>
            {m.cover ? (
              <img src={m.cover} alt={m.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(160,216,239,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>♪</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.artist}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => startEdit(m)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>编辑</button>
              <button onClick={() => onDelete(m._id)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.05)', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== 壁纸管理 Tab ==========
const WallpaperTab = ({ wallpapers, onDelete, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ src: '', theme: 'both', order: 0, active: true });

  const startAdd = () => {
    setEditing('new');
    setForm({ src: '', theme: 'both', order: wallpapers.length, active: false });
  };

  const startEdit = (w) => {
    setEditing(w._id);
    setForm({ src: w.src, theme: w.theme, order: w.order || 0, active: w.active });
  };

  const handleImageUpload = async (file) => {
    try {
      const res = await uploadAPI.uploadWallpaper(file);
      setForm({ ...form, src: res.url });
      showMessage('壁纸上传成功');
    } catch (err) {
      setError(err.response?.data?.error || '上传失败');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await wallpaperAPI.create(form);
        showMessage('添加成功');
      } else {
        await wallpaperAPI.update(editing, form);
        showMessage('更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    }
  };

  const toggleActive = async (w) => {
    try {
      await wallpaperAPI.update(w._id, { active: !w.active });
      onRefresh();
    } catch (err) {
      setError('操作失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>壁纸列表 ({wallpapers.length})</h3>
        <button onClick={startAdd} className="nav-button" style={{ padding: '6px 14px', border: 'none', cursor: 'pointer' }}>
          + 添加壁纸
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(160,216,239,0.05)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>壁纸图片</label>
            <input type="file" accept="image/*" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
            {form.src && <img src={form.src} alt="预览" style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>主题</label>
            <select value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
              <option value="both">亮色 + 暗色</option>
              <option value="light">仅亮色</option>
              <option value="dark">仅暗色</option>
            </select>
          </div>
          <input style={inputStyle} type="number" placeholder="排序" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            启用（显示在首页轮播中）
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="nav-button" style={{ padding: '6px 14px', border: 'none', cursor: 'pointer' }}>{editing === 'new' ? '添加' : '保存'}</button>
            <button type="button" onClick={() => setEditing(null)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}>取消</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {wallpapers.map((w) => (
          <div key={w._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px' }}>
            <img src={w.src} alt="壁纸" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {w.theme === 'both' ? '亮+暗' : w.theme === 'light' ? '亮色' : '暗色'}
                {' · '}排序 {w.order}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => toggleActive(w)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: w.active ? 'rgba(255,107,107,0.1)' : 'rgba(160,216,239,0.2)', cursor: 'pointer', fontSize: '0.8rem' }}>
                {w.active ? '禁用' : '启用'}
              </button>
              <button onClick={() => startEdit(w)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>编辑</button>
              <button onClick={() => onDelete(w._id)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.05)', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== 页面横幅 Tab ==========
const BannerTab = ({ banners, onRefresh, showMessage, setError }) => {
  const PAGE_BANNERS = [
    { pageId: 'banner_category', name: '分类页' },
    { pageId: 'banner_article', name: '文章详情页' },
    { pageId: 'banner_links', name: '友链页' },
    { pageId: 'banner_about', name: '关于我页' },
    { pageId: 'banner_chip', name: '小玩具页' },
  ];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ src: '', theme: 'both', active: true });
  const [uploading, setUploading] = useState(false);

  const existingBanner = (pageId) => banners.find(b => b.pageId === pageId);

  const startEdit = (pageId) => {
    const existing = existingBanner(pageId);
    setForm({
      src: existing?.src || '',
      theme: existing?.theme || 'both',
      active: existing?.active ?? true,
    });
    setEditing(pageId);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadWallpaper(file);
      setForm({ ...form, src: res.url });
      showMessage('图片上传成功');
    } catch (err) {
      setError(err.response?.data?.error || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (pageId) => {
    try {
      await bannerAPI.update(pageId, form);
      showMessage('横幅保存成功');
      setEditing(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (pageId) => {
    if (!confirm('确定删除该横幅？')) return;
    try {
      await bannerAPI.remove(pageId);
      showMessage('删除成功');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '删除失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  return (
    <div>
      {PAGE_BANNERS.map((pb) => {
        const banner = existingBanner(pb.pageId);
        const isEditing = editing === pb.pageId;

        return (
          <div key={pb.pageId} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{pb.name}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(pb.pageId)} style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {banner ? '编辑' : '添加'}
                </button>
                {banner && (
                  <button onClick={() => handleDelete(pb.pageId)} style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.05)', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>
                    删除
                  </button>
                )}
              </div>
            </div>

            {banner && !isEditing && (
              <img src={banner.src} alt={pb.name} style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }} />
            )}

            {isEditing && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>横幅图片</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ fontSize: '0.85rem' }} />
                  {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>上传中...</div>}
                  {form.src && <img src={form.src} alt="预览" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>主题</label>
                  <select value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
                    <option value="both">亮色 + 暗色</option>
                    <option value="light">仅亮色</option>
                    <option value="dark">仅暗色</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                  启用
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSubmit(pb.pageId)} className="nav-button" style={{ padding: '6px 14px', border: 'none', cursor: 'pointer' }}>保存</button>
                  <button onClick={() => setEditing(null)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}>取消</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ========== 社交链接 Tab ==========
const SocialLinkTab = ({ links, onRefresh, showMessage, setError }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', icon: '', order: 0, active: true });

  // 支持的社交平台列表（图标映射）
  const supportedPlatforms = [
    { value: 'github', label: 'GitHub' },
    { value: 'mail', label: '邮箱' },
    { value: 'bilibili', label: 'Bilibili' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'discord', label: 'Discord' },
    { value: 'wechat', label: '微信' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    // 向后兼容的Iconify格式
    { value: 'simple-icons:github', label: 'GitHub (Iconify)' },
    { value: 'simple-icons:bilibili', label: 'Bilibili (Iconify)' },
    { value: 'simple-icons:telegram', label: 'Telegram (Iconify)' },
    { value: 'simple-icons:twitter', label: 'Twitter (Iconify)' },
    { value: 'simple-icons:discord', label: 'Discord (Iconify)' },
    { value: 'openmoji:github', label: 'GitHub (OpenMoji)' },
    { value: 'openmoji:mail', label: '邮箱 (OpenMoji)' },
  ];

  const startNew = () => {
    setForm({ name: '', url: '', icon: '', order: links.length, active: true });
    setEditing('new');
  };

  const startEdit = (link) => {
    setForm({
      name: link.name,
      url: link.url,
      icon: link.icon,
      order: link.order || 0,
      active: link.active,
    });
    setEditing(link._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await socialLinkAPI.create(form);
        showMessage('社交链接创建成功');
      } else {
        await socialLinkAPI.update(editing, form);
        showMessage('社交链接更新成功');
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该社交链接？')) return;
    try {
      await socialLinkAPI.delete(id);
      showMessage('删除成功');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || '删除失败');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', color: 'var(--text-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };

  if (editing) {
    return (
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '16px' }}>{editing === 'new' ? '新建社交链接' : '编辑社交链接'}</h3>
        <input style={inputStyle} placeholder="名称 (如: GitHub)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input style={inputStyle} placeholder="链接 URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required />
        <input 
          style={inputStyle} 
          placeholder="平台名称或Iconify标识符 (如: github, bilibili, simple-icons:telegram)" 
          value={form.icon} 
          onChange={e => setForm({ ...form, icon: e.target.value })}
          list="platform-suggestions"
          required 
        />
        <datalist id="platform-suggestions">
          {supportedPlatforms.map(platform => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </datalist>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px', marginBottom: '12px' }}>
          推荐使用平台名称（如: github, bilibili）以获得SVG图标支持，或输入Iconify标识符向后兼容
        </div>
        <input style={inputStyle} placeholder="排序 (数字)" type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> 启用
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
      <button onClick={startNew} className="nav-button" style={{ border: 'none', cursor: 'pointer', marginBottom: '16px' }}>+ 新建社交链接</button>
      {links.map(link => (
        <div key={link._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{link.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{link.icon}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => startEdit(link)}>编辑</button>
            <button style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.05)', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleDelete(link._id)}>删除</button>
          </div>
        </div>
      ))}
      {links.length === 0 && <div style={{ color: 'var(--text-light)' }}>暂无社交链接</div>}
    </>
  );
};

export default Admin;
