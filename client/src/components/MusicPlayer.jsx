import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicIcon, PlayIcon, PauseIcon, PrevIcon, NextIcon, LoopIcon, ShuffleIcon, SequentialIcon, VolumeIcon, VolumeMuteIcon } from '../Icons';
import useStore from '../store/useStore';
import { musicAPI } from '../api/index.js';
import playlistData from '../data/playlist.json';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const {
    isMusicPlaying, setMusicPlaying,
    currentTrackIndex, setCurrentTrack,
    volume, setVolume,
    playMode, setPlayMode,
    currentTime, setCurrentTime,
    duration, setDuration,
    muted, setMuted,
    playlist, setPlaylist,
  } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // 点击外部关闭播放列表和面板
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (playerRef.current && !playerRef.current.contains(e.target)) {
        setShowPlaylist(false);
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const tracks = playlist.length > 0 ? playlist : playlistData.tracks;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // 获取音乐列表
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await musicAPI.getList();
        if (data && data.length > 0) {
          setPlaylist(data.map((m) => ({ id: m._id, title: m.title, artist: m.artist, src: m.src, cover: m.cover })));
        }
      } catch {
        // API 失败时使用本地 playlist.json
      }
    };
    fetchMusic();
  }, []);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // 播放/暂停
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
    if (!currentTrack?.src) return;
    setMusicPlaying(!isMusicPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = useCallback(() => {
    if (playMode === 'loop') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (playMode === 'random') {
      const rand = Math.floor(Math.random() * tracks.length);
      setCurrentTrack(rand);
    } else {
      const next = (currentTrackIndex + 1) % tracks.length;
      setCurrentTrack(next);
    }
  }, [playMode, currentTrackIndex, tracks.length]);

  const prevTrack = () => {
    const prev = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    setCurrentTrack(prev);
  };

  const nextTrack = () => {
    const next = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrack(next);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      setVolume(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
      setMuted(true);
    }
  };

  const cyclePlayMode = () => {
    const modes = ['sequential', 'loop', 'random'];
    const idx = modes.indexOf(playMode);
    setPlayMode(modes[(idx + 1) % modes.length]);
  };

  const handleTrackDoubleClick = (index) => {
    setCurrentTrack(index);
    setMusicPlaying(true);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const playModeIcon = playMode === 'loop' ? <LoopIcon /> : playMode === 'random' ? <ShuffleIcon /> : <SequentialIcon />;
  const playModeLabel = playMode === 'loop' ? '单曲循环' : playMode === 'random' ? '随机播放' : '顺序播放';

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player" ref={playerRef}>
      <motion.button
        className="music-toggle-btn"
        onClick={() => { setExpanded(!expanded); setShowPlaylist(false); }}
        aria-label="音乐播放器"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <MusicIcon />
      </motion.button>

      <AnimatePresence>
        {expanded && currentTrack && (
          <motion.div
            className="music-panel"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
          >
            {/* 封面区域 */}
            <div className="music-cover-wrapper">
              {currentTrack.cover ? (
                <img src={currentTrack.cover} alt={currentTrack.title} className={`music-cover-img ${isMusicPlaying ? 'playing' : ''}`} />
              ) : (
                <div className={`music-disc ${isMusicPlaying ? 'playing' : ''}`}>
                  <div className="music-disc-inner" />
                </div>
              )}
            </div>

            {/* 信息 + 进度条 */}
            <div className="music-main">
              <div className="music-info">
                <div className="music-title">{currentTrack.title}</div>
                {currentTrack.artist && <div className="music-artist">{currentTrack.artist}</div>}
              </div>

              <div className="music-progress" onClick={handleSeek}>
                <div className="music-progress-fill" style={{ width: `${progress}%` }} />
                <div className="music-progress-thumb" style={{ left: `${progress}%` }} />
              </div>

              <div className="music-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* 控制按钮 */}
              <div className="music-controls">
                <button onClick={cyclePlayMode} className="music-mode-btn" aria-label={playModeLabel} title={playModeLabel}>
                  {playModeIcon}
                </button>
                <button onClick={prevTrack} className="music-ctrl-btn" aria-label="上一曲">
                  <PrevIcon />
                </button>
                <button onClick={togglePlay} className="music-play-btn" aria-label={isMusicPlaying ? '暂停' : '播放'}>
                  {isMusicPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={nextTrack} className="music-ctrl-btn" aria-label="下一曲">
                  <NextIcon />
                </button>
                <button onClick={toggleMute} className="music-vol-btn" aria-label={muted ? '取消静音' : '静音'}>
                  {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  aria-label="音量"
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  className="music-vol-slider"
                />
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="music-list-btn"
                  aria-label="播放列表"
                  title="播放列表"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* 播放列表 */}
            <AnimatePresence>
              {showPlaylist && (
                <motion.div
                  className="music-playlist"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="music-playlist-header">
                    <span>播放列表</span>
                    <span className="music-playlist-count">{tracks.length} 首</span>
                  </div>
                  <div className="music-playlist-scroll">
                    {tracks.map((track, index) => (
                      <div
                        key={track.id || index}
                        className={`music-playlist-item ${index === currentTrackIndex ? 'active' : ''}`}
                        onDoubleClick={() => handleTrackDoubleClick(index)}
                      >
                        <div className="music-playlist-item-info">
                          <span className="music-playlist-num">{index + 1}</span>
                          <div className="music-playlist-item-text">
                            <span className="music-playlist-item-title">{track.title}</span>
                            {track.artist && <span className="music-playlist-item-artist">{track.artist}</span>}
                          </div>
                        </div>
                        {index === currentTrackIndex && isMusicPlaying && (
                          <div className="music-playlist-playing-indicator">
                            <span /><span /><span />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={currentTrack?.src || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;
