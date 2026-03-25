import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommentSection from './CommentSection';

// Mock API
vi.mock('../api/index.js', () => ({
  commentAPI: {
    getList: vi.fn().mockResolvedValue([
      { id: '1', content: 'Great post!', createdAt: '2026-01-01T00:00:00Z', user: { id: 'u1', username: 'alice', avatar: null } },
    ]),
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock store — no user logged in
vi.mock('../store/useStore', () => ({
  default: (selector) => selector({ user: null }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...props }) => {
      const { initial, animate, transition, whileHover, whileTap, exit, variants, key, ...domProps } = props;
      const Tag = typeof tag === 'string' ? tag : 'div';
      return <Tag {...domProps}>{children}</Tag>;
    },
  }),
  AnimatePresence: ({ children }) => children,
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CommentSection', () => {
  it('shows comment count after loading', async () => {
    renderWithRouter(<CommentSection articleId="abc" />);
    expect(await screen.findByText('评论 (1)')).toBeInTheDocument();
  });

  it('shows comment content and author', async () => {
    renderWithRouter(<CommentSection articleId="abc" />);
    expect(await screen.findByText('Great post!')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('does not show comment form when not logged in', async () => {
    renderWithRouter(<CommentSection articleId="abc" />);
    await screen.findByText('评论 (1)');
    expect(screen.queryByPlaceholderText('写下你的想法...')).not.toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    const { commentAPI } = await import('../api/index.js');
    vi.mocked(commentAPI.getList).mockResolvedValueOnce([]);
    renderWithRouter(<CommentSection articleId="empty" />);
    expect(await screen.findByText('暂无评论，来抢沙发吧~')).toBeInTheDocument();
  });
});
