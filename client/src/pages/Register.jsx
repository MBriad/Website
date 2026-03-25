import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../api/index.js';
import useStore from '../store/useStore.js';
import Loading from '../components/Loading.jsx';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);
    try {
      const data = await userAPI.register(username, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '注册失败');
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

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
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
          注册<span className="highlight-blue">账号</span>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>确认密码</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} />
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
            {loading ? <><Loading mode="inline" /> 注册中...</> : '注册'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            已有账号？ <Link to="/login" style={{ color: 'var(--accent-blue, #a0d8ef)' }}>去登录</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
