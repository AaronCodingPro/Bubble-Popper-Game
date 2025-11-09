// pages/index.tsx
import React, { useMemo, useState, useRef } from "react";
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
  const [gameOver, setGameOver] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const howToRef = useRef<HTMLDivElement>(null);
  const emojiList = ["🎉", "😃", "🔥", "💥", "✨", "🥳", "🦄", "🍀", "🚀", "🌈", "😎", "👾", "🎈", "🍭", "🧸", "🪩", "🦋", "🍕", "🍦", "🧃", "🎵"];
  const bgAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (playing && !gameOver) {
      if (!bgAudioRef.current) {
        bgAudioRef.current = new window.Audio('/bg.mp3');
        bgAudioRef.current.loop = true;
      }
      bgAudioRef.current.play();
    } else {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      }
    }
  }, [playing, gameOver]);

  React.useEffect(() => {
    if (!showHowTo) return;
    function handleClickOutside(e: MouseEvent) {
      if (howToRef.current && !howToRef.current.contains(e.target as Node)) {
        setShowHowTo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHowTo]);

  // combo logic: if next pop within 800ms -> increase combo multiplier
  function handleScore(points: number, bubble?: { x: number; y: number }, poison?: boolean) {
    if (poison) {
      setPlaying(false);
      setGameOver(true);
      return;
    }
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
        // Play yay sound
        const yayAudio = new window.Audio('/yay.mp3');
        yayAudio.play();
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
    setGameOver(false);
    setPlaying(true);
    setCollectedEmojis([]);
    setEmojiPopup(null);
    // Restart bg music
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current.play();
    }
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
    <>
      {/* How to Play Button */}
      <div style={{ position: "fixed", top: 18, right: 32, zIndex: 120 }}>
        <button
          onClick={() => setShowHowTo(true)}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: 14,
            border: "none",
            fontWeight: 700,
            fontSize: "1.2rem",
            background: "linear-gradient(90deg,#ffd166,#9b5de5,#4aa3ff)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
            cursor: "pointer",
            letterSpacing: "0.03em",
            transition: "transform 0.18s",
          }}
        >
           How to Play<span role="img" aria-label="How to play button">❓</span>
        </button>
      </div>
      {/* How to Play Popup */}
      {showHowTo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.18)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeInBg 0.6s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <div
            ref={howToRef}
            style={{
              background: "#fff",
              borderRadius: 22,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: "2.2rem 2.8rem 2.2rem 2.8rem",
              maxWidth: 420,
              width: "90vw",
              textAlign: "center",
              fontSize: "1.25rem",
              color: "#333",
              position: "relative",
              animation: "howToPopIn 0.7s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: 12, background: "linear-gradient(90deg,#ffd166,#9b5de5,#4aa3ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
              How to Play <span role="img" aria-label="sparkles">✨</span>
            </div>
            <div style={{ fontSize: "1.1rem", marginBottom: 18 }}>
              <span role="img" aria-label="bubble">🫧</span> <b>Pop the bubbles</b> to score points!<br/>
              <span role="img" aria-label="skull">💀</span> <b>Don't pop poison bubbles!</b> They end the game.<br/>
              <span role="img" aria-label="rocket">🚀</span> <b>Level up</b> every 100 points for more challenge.<br/>
              <span role="img" aria-label="trophy">🏆</span> <b>Conquer emojis</b> by popping bubbles at score milestones.<br/>
              <span role="img" aria-label="music">🎵</span> <b>Enjoy the music</b> and have fun!<br/>
            </div>
            
            <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>
              <span role="img" aria-label="pointer">👉</span> <b>Tip:</b> Click fast for combos and higher scores!
            </div>
            <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>
              <span role="img" aria-label="pointer">👉</span> <b>Hint:</b> Each level makes bubbles spawn and float faster!
            </div>
            <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>
              <span role="img" aria-label="pointer">👉</span> <b>Challenge:</b> Can you conquer all the emojis?
            </div>
            <div style={{ fontSize: "1.6rem", marginTop: 18 }}>
              <span role="img" aria-label="heart">❤️</span> Good luck and have fun! <span role="img" aria-label="party">🥳</span>
            </div>
          </div>
        </div>
      )}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0.5rem",
          backgroundImage: "radial-gradient(circle, #d93b95, #cc58b3, #ba6fca, #a784da, #9595e4, #8c95e3, #8495e1, #7b95df, #7686d8, #7376cf, #7266c5, #7355ba)",
          boxSizing: "border-box",
          gap: 36,
        }}
      >
        <div style={{ flex: '0 0 auto', minWidth: 0, position: 'relative', pointerEvents: gameOver ? 'none' : 'auto', opacity: gameOver ? 0.4 : 1 }}>
          <BubblePopperHeading />
          {/* Emoji popup */}
          {emojiPopup && !gameOver && (
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
          {showLevelUp && !gameOver && (
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
              pointerEvents: gameOver ? 'none' : 'auto',
              opacity: gameOver ? 0.4 : 1,
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
            pointerEvents: gameOver ? 'none' : 'auto',
            opacity: gameOver ? 0.4 : 1,
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
        {/* Game Over Popup */}
        {gameOver && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "#fff",
              color: "#ff2222",
              fontWeight: 900,
              fontSize: 38,
              borderRadius: 18,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: "2.2rem 3.2rem",
              zIndex: 9999,
              opacity: 0.98,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 18 }}>Game Over!</div>
            <button
              onClick={resetGame}
              style={{
                marginTop: 12,
                padding: "0.8rem 2.2rem",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                background: "#4aa3ff",
                color: "#fff",
                fontSize: 22,
                boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
              }}
            >
              Restart
            </button>
          </div>
        )}
      </main>
      <footer
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          textAlign: "center",
          padding: "1.2rem 0 1.1rem 0",
          fontSize: "1.6rem",
          fontFamily: "Comic Sans MS, Comic Sans, cursive, sans-serif",
          letterSpacing: "0.03em",
          background: "rgba(255,255,255,0.92)",
          zIndex: 100,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <span
          style={{
            background: "linear-gradient(to right, #dc2626, #facc15, #ec4899)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            fontWeight: 700,
          }}
        >
          Created with lots of ❤️ by Aaron from Singapore 
        </span>
        🇸🇬
      </footer>
      {/* Add keyframes for fade in/out and popup animation */}
      <style>{`
@keyframes fadeInBg {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes howToPopIn {
  0% { transform: scale(0.7) rotate(-8deg); opacity: 0; }
  60% { transform: scale(1.08) rotate(4deg); opacity: 1; }
  80% { transform: scale(0.98) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
`}</style>
    </>
  );
}
