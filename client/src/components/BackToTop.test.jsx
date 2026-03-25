import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import BackToTop from './BackToTop';

const setScrollY = (value) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
};

describe('BackToTop', () => {
  beforeEach(() => {
    setScrollY(0);
  });

  it('button is not visible initially (scrollY = 0)', () => {
    render(<BackToTop />);
    expect(document.querySelector('.back-to-top')).not.toBeInTheDocument();
  });

  it('renders after scroll event past threshold', () => {
    render(<BackToTop />);
    act(() => {
      setScrollY(500);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(document.querySelector('.back-to-top')).toBeInTheDocument();
  });

  it('does not render when scroll is below threshold', () => {
    render(<BackToTop />);
    act(() => {
      setScrollY(200);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(document.querySelector('.back-to-top')).not.toBeInTheDocument();
  });
});
