import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { commentAPI } from '../api/index.js';
import useStore from '../store/useStore.js';
import Loading from './Loading.jsx';

const CommentSection = ({ articleId }) => {
  const user = useStore((s) => s.user);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentAPI.getList(articleId);
        setComments(data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const newComment = await commentAPI.create(articleId, content.trim());
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.error || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentAPI.remove(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.section
      className="comment-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <h2 className="comment-title">评论 ({comments.length})</h2>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          {error && <div className="comment-error">{error}</div>}
          <textarea
            className="comment-textarea"
            placeholder="写下你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={3}
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">{content.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="comment-submit-btn"
            >
              {submitting ? '发送中...' : '发表评论'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/user-login">登录</Link> 或 <Link to="/register">注册</Link> 后发表评论
        </div>
      )}

      {loading ? (
        <Loading mode="inline" />
      ) : comments.length === 0 ? (
        <p className="comment-empty">暂无评论，来抢沙发吧~</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              className="comment-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="comment-avatar">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt={comment.user.username} />
                ) : (
                  <span>{comment.user.username[0]}</span>
                )}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.username}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
                {user && (user.id === comment.user.id || user.role === 'admin') && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="删除评论"
                  >
                    删除
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default CommentSection;
