// pages/index.tsx
import React, { useMemo, useState } from "react";
import BubblePopperHeading from "../components/BubblePopperHeading";
import GameArea from "../components/GameArea";

export default function Home(): JSX.Element {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lastPopTimestamp, setLastPopTimestamp] = useState<number | null>(null);
  const [combo, setCombo] = useState(1);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameParams, setGameParams] = useState({ spawnRate: 650, driftInterval: 220, upwardBias: 0.45 });
  const [emojiPopup, setEmojiPopup] = useState<{ x: number; y: number; emoji: string } | null>(null);
  const [collectedEmojis, setCollectedEmojis] = useState<string[]>([]);
  const emojiList = ["🎉", "😃", "🔥", "💥", "✨", "🥳", "🦄", "🍀", "🚀", "🌈", "😎", "👾", "🎈", "🍭", "🧸", "🪩", "🦋", "🍕", "🍦", "🧃", "🎵"];

  // combo logic: if next pop within 800ms -> increase combo multiplier
  function handleScore(points: number, bubble?: { x: number; y: number }) {
    const now = Date.now();
    if (lastPopTimestamp && now - lastPopTimestamp <= 800) {
      setCombo((c) => Math.min(5, c + 1));
    } else {
      setCombo(1);
    }
    setLastPopTimestamp(now);
    const gained = points * combo;
    const newScore = score + gained;
    setScore(newScore);
    // Level up logic
    const nextLevel = Math.floor(newScore / 100) + 1;
    if (nextLevel > level) {
      setLevel(nextLevel);
      setShowLevelUp(true);
      // Increase difficulty: faster spawn, faster drift, faster float
      setGameParams((prev) => ({
        spawnRate: Math.max(250, prev.spawnRate - 60),
        driftInterval: Math.max(90, prev.driftInterval - 18),
        upwardBias: prev.upwardBias + 0.08,
      }));
      setTimeout(() => setShowLevelUp(false), 1800);
    }
    // Emoji popup logic
    if (bubble) {
      const prevScore = score;
      const prevMult = Math.floor(prevScore / 20);
      const newMult = Math.floor(newScore / 20);
      if (newMult > prevMult) {
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        setEmojiPopup({ x: bubble.x, y: bubble.y, emoji });
        setCollectedEmojis((arr) => arr.includes(emoji) ? arr : [...arr, emoji]);
        setTimeout(() => setEmojiPopup(null), 2000);
      }
    }
  }

  function resetGame() {
    setScore(0);
    setCombo(1);
    setLastPopTimestamp(null);
    setLevel(1);
    setShowLevelUp(false);
    setGameParams({ spawnRate: 650, driftInterval: 220, upwardBias: 0.45 });
  }

  function togglePlay() {
    if (playing) {
      setPlaying(false);
    } else {
      resetGame();
      setPlaying(true);
    }
  }

  const playLabel = playing ? "Stop" : "Play";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(180deg, #f5f7fb 0%, #ffffff 100%)",
        boxSizing: "border-box",
        gap: 36,
      }}
    >
      <div style={{ flex: '0 0 auto', minWidth: 0, position: 'relative' }}>
        <BubblePopperHeading />
        {/* Emoji popup */}
        {emojiPopup && (
          <div
            style={{
              position: "absolute",
              left: `calc(${emojiPopup.x}% - 24px)`,
              top: `calc(${emojiPopup.y}% - 24px)`,
              fontSize: 44,
              pointerEvents: "none",
              zIndex: 999,
              transition: "opacity 0.5s",
              opacity: 0.98,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.18))"
            }}
          >
            {emojiPopup.emoji}
          </div>
        )}
        {/* Level up popup */}
        {showLevelUp && (
          <div
            style={{
              position: "fixed",
              top: "18%",
              left: "50%",
              transform: "translate(-50%,0)",
              background: "linear-gradient(90deg,#ffd166,#9b5de5,#4aa3ff)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 32,
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: "1.2rem 2.2rem",
              zIndex: 999,
              opacity: 0.96,
              animation: "levelUpPop 1.8s cubic-bezier(.2,.8,.2,1)"
            }}
          >
            Level {level}!
          </div>
        )}
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={togglePlay}
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              background: playing ? "#ff6b6b" : "#4aa3ff",
              color: "#fff",
            }}
          >
            {playLabel}
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#666" }}>Score</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{score}</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#666" }}>Combo</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>×{combo}</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#666" }}>Level</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{level}</div>
          </div>
        </div>
        <GameArea
          playing={playing}
          onScore={handleScore}
          spawnRate={gameParams.spawnRate}
          driftInterval={gameParams.driftInterval}
          upwardBias={gameParams.upwardBias}
        />
      </div>
      {/* Collected Emojis Box - shifted down to align with game area */}
      <div
        style={{
          width: 220,
          minHeight: 320,
          alignSelf: 'flex-start',
          marginTop: 'calc(60vh - 260px)', // shift further down
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 18px rgba(0,0,0,0.10)",
          border: "2px solid #e6eefc",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 19, color: "#4aa3ff", marginBottom: 12 }}>Conquered</div>
        {collectedEmojis.length === 0 ? (
          <div style={{ color: "#bbb", fontSize: 22 }}>—</div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
            {collectedEmojis.map((emoji) => (
              <div key={emoji} style={{ fontSize: 38 }}>{emoji}</div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
