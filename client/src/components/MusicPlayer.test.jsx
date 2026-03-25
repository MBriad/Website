import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicPlayer from './MusicPlayer';

// Mock zustand store
vi.mock('../store/useStore', () => ({
  default: () => ({
    isMusicPlaying: false,
    setMusicPlaying: vi.fn(),
    currentTrackIndex: 0,
    setCurrentTrack: vi.fn(),
    volume: 0.5,
    setVolume: vi.fn(),
    playMode: 'sequential',
    setPlayMode: vi.fn(),
    currentTime: 0,
    setCurrentTime: vi.fn(),
    duration: 0,
    setDuration: vi.fn(),
    muted: false,
    setMuted: vi.fn(),
    playlist: [],
    setPlaylist: vi.fn(),
  }),
}));

// Mock API
vi.mock('../api/index.js', () => ({
  musicAPI: {
    getList: vi.fn().mockRejectedValue(new Error('offline')),
  },
}));

describe('MusicPlayer', () => {
  it('renders toggle button', () => {
    render(<MusicPlayer />);
    expect(document.querySelector('.music-toggle-btn')).toBeInTheDocument();
  });

  it('panel is hidden by default', () => {
    render(<MusicPlayer />);
    expect(document.querySelector('.music-panel')).not.toBeInTheDocument();
  });

  it('shows panel on toggle click', () => {
    render(<MusicPlayer />);
    fireEvent.click(document.querySelector('.music-toggle-btn'));
    expect(document.querySelector('.music-panel')).toBeInTheDocument();
  });

  it('shows play button in panel', () => {
    render(<MusicPlayer />);
    fireEvent.click(document.querySelector('.music-toggle-btn'));
    expect(document.querySelector('.music-play-btn')).toBeInTheDocument();
  });

  it('shows track title and progress bar', () => {
    render(<MusicPlayer />);
    fireEvent.click(document.querySelector('.music-toggle-btn'));
    expect(screen.getByText('通い合う心')).toBeInTheDocument();
    expect(document.querySelector('.music-progress')).toBeInTheDocument();
  });
});
