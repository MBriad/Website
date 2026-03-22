import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicIcon, PlayIcon, PauseIcon } from '../Icons';
import useStore from '../store/useStore';
import playlistData from '../data/playlist.json';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const {
    isMusicPlaying, setMusicPlaying,
    currentTrackIndex, setCurrentTrack,
    volume, setVolume,
  } = useStore();
  const [expanded, setExpanded] = useState(false);

  const tracks = playlistData.tracks;
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => setMusicPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, currentTrackIndex]);

  const togglePlay = () => {
    if (!currentTrack.src) return;
    setMusicPlaying(!isMusicPlaying);
  };

  const handleEnded = () => {
    const next = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrack(next);
  };

  return (
    <div className="music-player">
      <motion.button
        className="music-toggle-btn"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MusicIcon />
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="music-panel"
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <button className="music-play-btn" onClick={togglePlay}>
              {isMusicPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="music-info">
              <div className="music-title">{currentTrack.title}</div>
            </div>

            <div className="music-vol">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={handleEnded}
        preload="none"
      />
    </div>
  );
};

export default MusicPlayer;
