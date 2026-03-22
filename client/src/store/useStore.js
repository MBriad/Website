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
    document.documentElement.dataset.theme = next;
    return { theme: next };
  }),

  isMusicPlaying: false,
  currentTrackIndex: 0,
  volume: 0.5,
  setMusicPlaying: (v) => set({ isMusicPlaying: v }),
  setCurrentTrack: (i) => set({ currentTrackIndex: i }),
  setVolume: (v) => set({ volume: v }),
}));

export default useStore;
