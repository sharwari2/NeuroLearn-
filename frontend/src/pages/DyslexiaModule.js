import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Lexend font — designed specifically for dyslexia readability
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector("[href*='Lexend']")) {
  document.head.appendChild(fontLink);
}

const SAMPLE_LESSONS = [
  {
    id: 1,
    title: 'The Water Cycle',
    content:
      'Water moves in a continuous cycle on Earth. The sun heats water in rivers, lakes, and oceans, turning it into water vapor that rises into the sky. As the vapor cools high in the atmosphere, it condenses into tiny water droplets, forming clouds. When enough droplets combine, they fall back to Earth as rain or snow — and the cycle begins again.',
  },
  {
    id: 2,
    title: 'How Plants Make Food',
    content:
      "Plants are amazing living factories. They use sunlight, water, and carbon dioxide from the air to make their own food in a process called photosynthesis. Tiny structures called chloroplasts inside the leaves capture sunlight. The plant uses this energy to turn water and carbon dioxide into glucose — a sugar that fuels the plant's growth.",
  },
  {
    id: 3,
    title: 'The Solar System',
    content:
      'Our solar system is a vast family of planets, moons, and other objects that orbit the Sun. The Sun is at the center and provides light and warmth. The eight planets, in order from the Sun, are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet known to support life.',
  },
];

function tokenize(text) {
  const tokens = [];
  let wordIdx = 0;
  const regex = /(\S+|\s+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const isWord = /\S/.test(match[0]);
    tokens.push({ text: match[0], wordIndex: isWord ? wordIdx : null, isWord });
    if (isWord) wordIdx++;
  }
  return tokens;
}

export default function DyslexiaModule() {
  const navigate = useNavigate();
  const [lessons] = useState(SAMPLE_LESSONS);
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(0.85);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [lineSpacing, setLineSpacing] = useState(1.9);
  const [progress, setProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef(null);
  const tokens = tokenize(selectedLesson.content);
  const words = tokens.filter((t) => t.isWord);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const english = allVoices.filter((v) => v.lang.startsWith('en'));
      setVoices(english);
      setSelectedVoice((prev) => prev ?? (english[0] || null));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPaused]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const speak = useCallback(
    (startWordIndex = 0) => {
      window.speechSynthesis.cancel();
      setCurrentWordIndex(-1);
      const textToSpeak = words.slice(startWordIndex).map((t) => t.text).join(' ');
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.rate = speed;
      utter.pitch = pitch;
      utter.volume = volume;
      if (selectedVoice) utter.voice = selectedVoice;
      let wordOffset = startWordIndex;
      utter.onboundary = (e) => {
        if (e.name === 'word') {
          setCurrentWordIndex(wordOffset);
          setWordCount(wordOffset + 1);
          setProgress(((wordOffset + 1) / words.length) * 100);
          wordOffset++;
        }
      };
      utter.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        setProgress(100);
      };
      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
      setIsPaused(false);
    },
    [speed, pitch, volume, selectedVoice, words]
  );

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setElapsedTime(0);
      speak(0);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    setWordCount(0);
    setElapsedTime(0);
  };

  const handleLessonChange = (lesson) => {
    handleStop();
    setSelectedLesson(lesson);
  };

  const handleWordClick = (wordIndex) => {
    handleStop();
    setTimeout(() => speak(wordIndex), 100);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Dashboard</button>
          <div>
            <div style={styles.moduleTag}>📖 Dyslexia Module</div>
            <h1 style={styles.title}>Text to Speech</h1>
            <p style={styles.subtitle}>Click any word to start reading from there</p>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{wordCount} / {words.length}</div>
              <div style={styles.statLabel}>Words</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{formatTime(elapsedTime)}</div>
              <div style={styles.statLabel}>Time</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{speed}×</div>
              <div style={styles.statLabel}>Speed</div>
            </div>
          </div>
        </div>

        {/* QUICK NAV to other dyslexia features */}
        <div style={styles.featureNav}>
          <button style={{ ...styles.featureBtn, ...styles.featureBtnActive }}>
            🔊 Text to Speech
          </button>
          <button onClick={() => navigate('/dyslexia/audio')} style={styles.featureBtn}>
            🎧 Audio Lessons
          </button>
          <button style={{ ...styles.featureBtn, ...styles.featureBtnSoon }}>
            📝 Reading Exercises <span style={styles.soon}>Soon</span>
          </button>
        </div>

        <div style={styles.body}>

          {/* SIDEBAR */}
          <div style={styles.sidebar}>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>LESSONS</div>
              {lessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLessonChange(l)}
                  style={{
                    ...styles.lessonBtn,
                    ...(selectedLesson.id === l.id ? styles.lessonBtnActive : {}),
                  }}
                >
                  <span style={styles.lessonNum}>{l.id}</span>
                  {l.title}
                </button>
              ))}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>DISPLAY SETTINGS</div>
              <div style={styles.sliderRow}>
                <div style={styles.sliderMeta}>
                  <span style={styles.sliderLabel}>Font Size</span>
                  <span style={{ ...styles.sliderVal, color: '#4f8ef7' }}>{fontSize}px</span>
                </div>
                <input type="range" min={14} max={32} step={1} value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  style={styles.rangeInput} />
              </div>
              <div style={styles.sliderRow}>
                <div style={styles.sliderMeta}>
                  <span style={styles.sliderLabel}>Line Spacing</span>
                  <span style={{ ...styles.sliderVal, color: '#7c5cbf' }}>{lineSpacing}×</span>
                </div>
                <input type="range" min={1.4} max={3} step={0.1} value={lineSpacing}
                  onChange={(e) => setLineSpacing(Number(e.target.value))}
                  style={styles.rangeInput} />
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>VOICE</div>
              <select
                style={styles.select}
                onChange={(e) => setSelectedVoice(voices.find((v) => v.name === e.target.value))}
                value={selectedVoice?.name || ''}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MAIN */}
          <div style={styles.main}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>

            <div style={styles.textBox}>
              <h2 style={styles.lessonTitle}>{selectedLesson.title}</h2>
              <p style={{ ...styles.lessonText, fontSize, lineHeight: lineSpacing }}>
                {tokens.map((token, i) => {
                  if (!token.isWord) return <span key={i}>{token.text}</span>;
                  const isActive = token.wordIndex === currentWordIndex;
                  return (
                    <span
                      key={i}
                      onClick={() => handleWordClick(token.wordIndex)}
                      style={{ ...styles.word, ...(isActive ? styles.wordActive : {}) }}
                      title="Click to read from here"
                    >
                      {token.text}
                    </span>
                  );
                })}
              </p>
            </div>

            <div style={styles.sliderPanel}>
              {[
                { label: 'Speed',  value: speed,  min: 0.5, max: 2, step: 0.05, unit: '×',  color: '#4f8ef7', setter: setSpeed },
                { label: 'Pitch',  value: pitch,  min: 0.5, max: 2, step: 0.1,  unit: '',   color: '#f7994f', setter: setPitch },
                { label: 'Volume', value: volume, min: 0,   max: 1, step: 0.05, unit: '%',  color: '#4fbf7c', setter: setVolume,
                  display: Math.round(volume * 100) },
              ].map(({ label, value, min, max, step, unit, color, setter, display }) => (
                <div key={label} style={styles.sliderRow}>
                  <div style={styles.sliderMeta}>
                    <span style={styles.sliderLabel}>{label}</span>
                    <span style={{ ...styles.sliderVal, color }}>
                      {display !== undefined ? display : value}{unit}
                    </span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value}
                    onChange={(e) => setter(parseFloat(e.target.value))}
                    style={styles.rangeInput} />
                </div>
              ))}
            </div>

            <div style={styles.controls}>
              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                style={{
                  ...styles.ctrlBtn, ...styles.ctrlGhost,
                  ...(!isPlaying && !isPaused ? styles.ctrlDisabled : {}),
                }}
              >
                ⏹ Stop
              </button>
              {isPlaying && !isPaused ? (
                <button onClick={handlePause} style={{ ...styles.ctrlBtn, ...styles.ctrlSecondary }}>
                  ⏸ Pause
                </button>
              ) : (
                <button onClick={handlePlay} style={{ ...styles.ctrlBtn, ...styles.ctrlPrimary }}>
                  ▶ {isPaused ? 'Resume' : 'Play'}
                </button>
              )}
            </div>

            <p style={styles.hint}>💡 Tip: Click any word in the text above to jump to that point</p>
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
    flexWrap: 'wrap', gap: 16, marginBottom: 20,
  },
  backBtn: {
    background: '#fff', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '8px 16px', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', color: '#374151',
    fontFamily: "'Lexend', sans-serif", marginRight: 8,
  },
  moduleTag: {
    display: 'inline-block',
    background: 'linear-gradient(90deg,#4f8ef7,#7c5cbf)',
    color: '#fff', borderRadius: 20, padding: '4px 14px',
    fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8,
  },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a2e' },
  subtitle: { margin: '4px 0 0', fontSize: 14, color: '#6b7280' },
  statsRow: { display: 'flex', gap: 12, marginLeft: 'auto' },
  stat: {
    textAlign: 'center', background: '#fff', borderRadius: 12,
    padding: '10px 18px', boxShadow: '0 2px 8px rgba(79,142,247,0.10)',
  },
  statValue: { fontSize: 17, fontWeight: 700, color: '#4f8ef7' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 },
  featureNav: {
    display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
  },
  featureBtn: {
    padding: '10px 20px', borderRadius: 12,
    border: '1.5px solid #e5e7eb', background: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: '#374151', fontFamily: "'Lexend', sans-serif",
    display: 'flex', alignItems: 'center', gap: 6,
  },
  featureBtnActive: {
    background: 'linear-gradient(90deg,#eef3ff,#f3eeff)',
    borderColor: '#4f8ef7', color: '#4f8ef7',
  },
  featureBtnSoon: { opacity: 0.6, cursor: 'default' },
  soon: {
    fontSize: 10, background: '#f3f4f6', borderRadius: 6,
    padding: '2px 6px', color: '#9ca3af', fontWeight: 700,
  },
  body: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  sidebar: { width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 },
  main: { flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 },
  section: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.2 },
  lessonBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, background: '#fafafa', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#374151',
    textAlign: 'left', fontFamily: "'Lexend', sans-serif",
  },
  lessonBtnActive: {
    background: 'linear-gradient(90deg,#eef3ff,#f3eeff)',
    borderColor: '#4f8ef7', color: '#4f8ef7',
  },
  lessonNum: {
    width: 22, height: 22, borderRadius: '50%',
    background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
    color: '#fff', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  select: {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 13, fontFamily: "'Lexend', sans-serif",
    color: '#374151', background: '#fafafa', cursor: 'pointer', outline: 'none',
  },
  progressTrack: { height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg,#4f8ef7,#7c5cbf)',
    borderRadius: 99, transition: 'width 0.3s ease',
  },
  textBox: {
    background: '#fff', borderRadius: 20, padding: '28px 32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)', minHeight: 180,
  },
  lessonTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#1a1a2e' },
  lessonText: { margin: 0, color: '#374151', fontWeight: 400, letterSpacing: 0.3 },
  word: { cursor: 'pointer', borderRadius: 4, padding: '1px 2px', display: 'inline' },
  wordActive: { background: 'linear-gradient(90deg,#4f8ef7,#7c5cbf)', color: '#fff', borderRadius: 4 },
  sliderPanel: {
    background: '#fff', borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  sliderRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  sliderMeta: { display: 'flex', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 13, fontWeight: 600, color: '#374151' },
  sliderVal: { fontSize: 13, fontWeight: 700 },
  rangeInput: { width: '100%', cursor: 'pointer', accentColor: '#4f8ef7' },
  controls: { display: 'flex', gap: 12, justifyContent: 'center' },
  ctrlBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', borderRadius: 12, border: 'none',
    cursor: 'pointer', fontSize: 15, fontWeight: 600,
    fontFamily: "'Lexend', sans-serif",
  },
  ctrlPrimary: {
    background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
    color: '#fff', boxShadow: '0 4px 16px rgba(79,142,247,0.35)',
  },
  ctrlSecondary: { background: '#f0f4ff', color: '#4f8ef7', border: '1.5px solid #4f8ef7' },
  ctrlGhost: { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' },
  ctrlDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  hint: { textAlign: 'center', fontSize: 12.5, color: '#9ca3af', margin: 0 },
};