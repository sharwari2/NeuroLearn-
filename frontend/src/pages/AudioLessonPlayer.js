// PASTE THIS FILE AT:
// frontend/src/pages/AudioLessonPlayer.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Lexend font for dyslexia readability
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector("[href*='Lexend']")) {
  document.head.appendChild(fontLink);
}

// ── Sample audio lessons (replace with your MongoDB API call) ─────────────────
// In your real app, fetch from: GET /api/lessons?module=dyslexia&type=audio
// Each lesson needs: id, title, subject, duration, transcript, audioUrl
// audioUrl can be a file in /public/audio/ or a cloud storage URL
const AUDIO_LESSONS = [
  {
    id: 1,
    subject: 'Science',
    title: 'The Water Cycle',
    duration: 120,
    color: '#4f8ef7',
    emoji: '🌊',
    transcript: [
      { time: 0,  text: 'Welcome to this lesson on the Water Cycle.' },
      { time: 4,  text: 'Water moves in a continuous cycle on Earth.' },
      { time: 8,  text: 'The sun heats water in rivers, lakes, and oceans.' },
      { time: 13, text: 'This turns water into vapor that rises into the sky.' },
      { time: 18, text: 'As vapor cools, it condenses into tiny droplets, forming clouds.' },
      { time: 24, text: 'When enough droplets combine, they fall as rain or snow.' },
      { time: 30, text: 'And the cycle begins again. Amazing, right?' },
    ],
  },
  {
    id: 2,
    subject: 'Biology',
    title: 'How Plants Make Food',
    duration: 90,
    color: '#4fbf7c',
    emoji: '🌿',
    transcript: [
      { time: 0,  text: 'Today we learn about Photosynthesis.' },
      { time: 4,  text: 'Plants are amazing living factories.' },
      { time: 8,  text: 'They use sunlight, water, and carbon dioxide.' },
      { time: 13, text: 'Inside the leaves are tiny structures called chloroplasts.' },
      { time: 18, text: 'These capture sunlight and convert it into energy.' },
      { time: 23, text: 'That energy turns water and CO2 into glucose — plant food!' },
    ],
  },
  {
    id: 3,
    subject: 'Astronomy',
    title: 'The Solar System',
    duration: 150,
    color: '#9b6bf7',
    emoji: '🪐',
    transcript: [
      { time: 0,  text: 'Let\'s explore our Solar System.' },
      { time: 4,  text: 'The Sun sits at the center, providing light and warmth.' },
      { time: 9,  text: 'Eight planets orbit the Sun.' },
      { time: 13, text: 'Mercury, Venus, Earth, Mars — the inner rocky planets.' },
      { time: 19, text: 'Jupiter, Saturn, Uranus, Neptune — the outer gas giants.' },
      { time: 25, text: 'Earth is the only planet known to support life.' },
    ],
  },
  {
    id: 4,
    subject: 'History',
    title: 'Ancient Civilizations',
    duration: 180,
    color: '#f7994f',
    emoji: '🏛️',
    transcript: [
      { time: 0,  text: 'Ancient civilizations shaped our modern world.' },
      { time: 5,  text: 'Egypt, Mesopotamia, Greece, and Rome were among the greatest.' },
      { time: 11, text: 'They built monumental structures that still stand today.' },
      { time: 17, text: 'The Egyptians built the pyramids as tombs for their pharaohs.' },
      { time: 23, text: 'Greeks gave us democracy, philosophy, and the Olympics.' },
      { time: 29, text: 'Rome built an empire that influenced law and language forever.' },
    ],
  },
];

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function AudioLessonPlayer() {
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState(AUDIO_LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [completed, setCompleted] = useState([]);

  const intervalRef = useRef(null);
  const transcriptRef = useRef(null);

  // 🔊 TEXT TO SPEECH
const speakTranscript = () => {
  window.speechSynthesis.cancel();

  selectedLesson.transcript.forEach((line) => {
    const speech = new SpeechSynthesisUtterance(line.text);

    speech.rate = playbackRate;
    speech.volume = volume;

    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, line.time * 1000);
  });
};

const stopSpeech = () => {
  window.speechSynthesis.cancel();
};

  // Simulate audio playback with a timer (replace with real <audio> tag when you have audioUrl)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (0.1 * playbackRate);
          if (next >= selectedLesson.duration) {
            stopSpeech();

            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (!completed.includes(selectedLesson.id)) {
              setCompleted((c) => [...c, selectedLesson.id]);
            }
            return selectedLesson.duration;
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackRate, selectedLesson]);

  // Sync transcript highlight to current time
  useEffect(() => {
    const lines = selectedLesson.transcript;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) idx = i;
    }
    setCurrentTranscriptIndex(idx);
  }, [currentTime, selectedLesson]);

  // Auto-scroll active transcript line into view
  useEffect(() => {
    const el = document.getElementById(`transcript-line-${currentTranscriptIndex}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentTranscriptIndex]);

  const handleSelectLesson = (lesson) => {
    stopSpeech();

    setSelectedLesson(lesson);
    setCurrentTime(0);
    setIsPlaying(false);
    setCurrentTranscriptIndex(0);
  };

  const handlePlayPause = () => {
  setIsPlaying((prev) => {
    const newState = !prev;

    if (newState) {
      speakTranscript();   // ▶️ start speaking
    } else {
      stopSpeech();        // ⏸ stop speaking
    }

    return newState;
  });
};

  const handleSeek = (e) => {
    const val = (e.target.value / 100) * selectedLesson.duration;
    setCurrentTime(val);
  };

  const handleRewind = () => setCurrentTime((t) => Math.max(0, t - 10));
  const handleForward = () => setCurrentTime((t) => Math.min(selectedLesson.duration, t + 10));

  const handleTranscriptClick = (time) => {
  stopSpeech();

  setCurrentTime(time);

  setTimeout(() => {
    speakTranscript(); // restart speech
  }, 200);

  setIsPlaying(true);
};

  const progress = (currentTime / selectedLesson.duration) * 100;
  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={() => navigate('/dyslexia')} style={styles.backBtn}>
            ← Back
          </button>
          <div>
            <div style={styles.moduleTag}>🎧 Dyslexia Module</div>
            <h1 style={styles.title}>Audio Lessons</h1>
            <p style={styles.subtitle}>Listen and follow along with the transcript</p>
          </div>
          <div style={styles.completedBadge}>
            ✅ {completed.length} / {AUDIO_LESSONS.length} Done
          </div>
        </div>

        <div style={styles.body}>

          {/* LESSON LIST */}
          <div style={styles.sidebar}>
            <div style={styles.sectionTitle}>LESSONS</div>
            {AUDIO_LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson)}
                style={{
                  ...styles.lessonCard,
                  ...(selectedLesson.id === lesson.id ? { borderColor: lesson.color, background: `${lesson.color}10` } : {}),
                }}
              >
                <div style={{ ...styles.lessonEmoji, background: `${lesson.color}20` }}>
                  {lesson.emoji}
                </div>
                <div style={styles.lessonInfo}>
                  <div style={styles.lessonSubject}>{lesson.subject}</div>
                  <div style={styles.lessonName}>{lesson.title}</div>
                  <div style={styles.lessonDuration}>⏱ {formatTime(lesson.duration)}</div>
                </div>
                {completed.includes(lesson.id) && (
                  <div style={styles.doneCheck}>✓</div>
                )}
              </button>
            ))}
          </div>

          {/* PLAYER + TRANSCRIPT */}
          <div style={styles.main}>

            {/* Now Playing Card */}
            <div style={{ ...styles.nowPlaying, borderTop: `4px solid ${selectedLesson.color}` }}>
              <div style={styles.nowPlayingTop}>
                <div style={{ ...styles.bigEmoji, background: `${selectedLesson.color}20` }}>
                  {selectedLesson.emoji}
                </div>
                <div>
                  <div style={{ ...styles.nowSubject, color: selectedLesson.color }}>
                    {selectedLesson.subject}
                  </div>
                  <div style={styles.nowTitle}>{selectedLesson.title}</div>
                  <div style={styles.nowDuration}>
                    {formatTime(currentTime)} / {formatTime(selectedLesson.duration)}
                  </div>
                </div>
              </div>

              {/* Progress / Seek bar */}
              <div style={styles.seekRow}>
                <span style={styles.seekTime}>{formatTime(currentTime)}</span>
                <div style={styles.seekTrack}>
                  <div style={{ ...styles.seekFill, width: `${progress}%`, background: selectedLesson.color }} />
                  <input
                    type="range" min={0} max={100} step={0.1}
                    value={progress}
                    onChange={handleSeek}
                    style={styles.seekInput}
                  />
                </div>
                <span style={styles.seekTime}>{formatTime(selectedLesson.duration)}</span>
              </div>

              {/* Controls */}
              <div style={styles.controls}>
                <button onClick={handleRewind} style={styles.ctrlSecondary} title="Rewind 10s">
                  ⏪ 10s
                </button>
                <button
                  onClick={handlePlayPause}
                  style={{ ...styles.ctrlPlay, background: selectedLesson.color }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={handleForward} style={styles.ctrlSecondary} title="Forward 10s">
                  10s ⏩
                </button>
              </div>

              {/* Speed + Volume */}
              <div style={styles.settingsRow}>
                <div style={styles.settingGroup}>
                  <div style={styles.settingLabel}>Speed</div>
                  <div style={styles.rateRow}>
                    {rates.map((r) => (
                      <button
                        key={r}
                        onClick={() => setPlaybackRate(r)}
                        style={{
                          ...styles.rateBtn,
                          ...(playbackRate === r ? { background: selectedLesson.color, color: '#fff', borderColor: selectedLesson.color } : {}),
                        }}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.settingGroup}>
                  <div style={styles.settingLabel}>Volume — {Math.round(volume * 100)}%</div>
                  <input
                    type="range" min={0} max={1} step={0.05} value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{ ...styles.rangeInput, accentColor: selectedLesson.color }}
                  />
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div style={styles.transcriptBox} ref={transcriptRef}>
              <div style={styles.transcriptHeader}>📄 Transcript</div>
              <p style={styles.transcriptHint}>Click any line to jump to that point</p>
              <div style={styles.transcriptLines}>
                {selectedLesson.transcript.map((line, i) => (
                  <div
                    id={`transcript-line-${i}`}
                    key={i}
                    onClick={() => handleTranscriptClick(line.time)}
                    style={{
                      ...styles.transcriptLine,
                      ...(i === currentTranscriptIndex ? {
                        background: `${selectedLesson.color}15`,
                        borderLeft: `3px solid ${selectedLesson.color}`,
                        color: '#1a1a2e',
                        fontWeight: 600,
                      } : {}),
                    }}
                  >
                    <span style={{ ...styles.transcriptTime, color: selectedLesson.color }}>
                      {formatTime(line.time)}
                    </span>
                    <span style={styles.transcriptText}>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#f0f4ff 0%,#faf5ff 100%)',
    padding: '28px 16px',
    fontFamily: "'Lexend', sans-serif",
    boxSizing: 'border-box',
  },
  container: { maxWidth: 1100, margin: '0 auto' },
  header: {
    display: 'flex', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: 16, marginBottom: 28,
  },
  backBtn: {
    background: '#fff', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '8px 16px',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    color: '#374151', fontFamily: "'Lexend', sans-serif",
    marginRight: 8,
  },
  moduleTag: {
    display: 'inline-block',
    background: 'linear-gradient(90deg,#4f8ef7,#7c5cbf)',
    color: '#fff', borderRadius: 20, padding: '4px 14px',
    fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8,
  },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a2e' },
  subtitle: { margin: '4px 0 0', fontSize: 14, color: '#6b7280' },
  completedBadge: {
    marginLeft: 'auto', background: '#fff',
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#374151',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  body: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  sidebar: { width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  sectionTitle: {
    fontSize: 10, fontWeight: 700, color: '#9ca3af',
    letterSpacing: 1.2, marginBottom: 4,
  },
  lessonCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px', border: '1.5px solid #e5e7eb',
    borderRadius: 14, background: '#fff', cursor: 'pointer',
    textAlign: 'left', fontFamily: "'Lexend', sans-serif",
    transition: 'all 0.15s', position: 'relative',
  },
  lessonEmoji: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
  },
  lessonInfo: { flex: 1, minWidth: 0 },
  lessonSubject: { fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.8 },
  lessonName: { fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginTop: 2 },
  lessonDuration: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  doneCheck: {
    width: 20, height: 20, borderRadius: '50%',
    background: '#4fbf7c', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  main: { flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 },
  nowPlaying: {
    background: '#fff', borderRadius: 20,
    padding: '24px 28px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  nowPlayingTop: { display: 'flex', alignItems: 'center', gap: 16 },
  bigEmoji: {
    width: 64, height: 64, borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, flexShrink: 0,
  },
  nowSubject: { fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  nowTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginTop: 4 },
  nowDuration: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  seekRow: { display: 'flex', alignItems: 'center', gap: 10 },
  seekTime: { fontSize: 12, color: '#9ca3af', fontWeight: 500, flexShrink: 0 },
  seekTrack: { flex: 1, position: 'relative', height: 6, background: '#e5e7eb', borderRadius: 99 },
  seekFill: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 99, pointerEvents: 'none' },
  seekInput: {
    position: 'absolute', top: '50%', left: 0,
    transform: 'translateY(-50%)', width: '100%',
    opacity: 0, cursor: 'pointer', height: 20, margin: 0, zIndex: 2,
  },
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 },
  ctrlPlay: {
    width: 60, height: 60, borderRadius: '50%',
    border: 'none', color: '#fff', fontSize: 22,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: "'Lexend', sans-serif",
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  ctrlSecondary: {
    padding: '10px 16px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', background: '#f9fafb',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: '#374151', fontFamily: "'Lexend', sans-serif",
  },
  settingsRow: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  settingGroup: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 180 },
  settingLabel: { fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.8 },
  rateRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  rateBtn: {
    padding: '5px 10px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', background: '#f9fafb',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    color: '#374151', fontFamily: "'Lexend', sans-serif",
  },
  rangeInput: { width: '100%', cursor: 'pointer' },
  transcriptBox: {
    background: '#fff', borderRadius: 20,
    padding: '24px 28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  transcriptHeader: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  transcriptHint: { fontSize: 12, color: '#9ca3af', margin: '0 0 16px' },
  transcriptLines: { display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' },
  transcriptLine: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 12px', borderRadius: 10,
    cursor: 'pointer', borderLeft: '3px solid transparent',
    transition: 'all 0.2s',
  },
  transcriptTime: { fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 },
  transcriptText: { fontSize: 15, color: '#374151', lineHeight: 1.6 },
};