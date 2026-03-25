import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
  }
  return 'light';
};

const useStore = create((set) => ({
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    return { theme: next };
  }),

  isMusicPlaying: false,
  currentTrackIndex: 0,
  volume: 0.5,
  playMode: 'sequential', // 'loop' | 'sequential' | 'random'
  currentTime: 0,
  duration: 0,
  muted: false,
  playlist: [],
  setMusicPlaying: (v) => set({ isMusicPlaying: v }),
  setCurrentTrack: (i) => set({ currentTrackIndex: i }),
  setVolume: (v) => set({ volume: v }),
  setPlayMode: (m) => set({ playMode: m }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setMuted: (m) => set({ muted: m }),
  setPlaylist: (p) => set({ playlist: p }),

  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
  },
}));

export default useStore;
