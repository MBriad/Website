import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../api/index.js';
import useStore from '../store/useStore.js';
import Loading from '../components/Loading.jsx';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await userAPI.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1rem',
    color: 'var(--text-ink)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="article-detail-container">
      <motion.div
        className="article-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="article-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
          用户<span className="highlight-blue">登录</span>
        </h1>

        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              用户名
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              密码
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nav-button"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <><Loading mode="inline" /> 登录中...</> : '登录'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            没有账号？ <Link to="/register" style={{ color: 'var(--accent-blue, #a0d8ef)' }}>去注册</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default UserLogin;
