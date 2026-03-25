import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('renders page mode with default text', () => {
    render(<Loading />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
    expect(document.querySelector('.loading-container')).toBeInTheDocument();
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('renders custom text in page mode', () => {
    render(<Loading text="请稍候" />);
    expect(screen.getByText('请稍候')).toBeInTheDocument();
  });

  it('renders inline mode with 3 dots', () => {
    render(<Loading mode="inline" />);
    expect(document.querySelector('.loading-inline')).toBeInTheDocument();
    const dots = document.querySelectorAll('.loading-dot');
    expect(dots).toHaveLength(3);
    expect(document.querySelector('.loading-container')).not.toBeInTheDocument();
  });

  it('does not show spinner in inline mode', () => {
    render(<Loading mode="inline" />);
    expect(document.querySelector('.loading-spinner')).not.toBeInTheDocument();
  });

  it('does not show loading text in inline mode', () => {
    render(<Loading mode="inline" />);
    expect(document.querySelector('.loading-text')).not.toBeInTheDocument();
  });
});
