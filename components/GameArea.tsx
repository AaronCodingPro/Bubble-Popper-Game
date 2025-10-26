// components/GameArea.tsx
import React, { useEffect, useRef, useState } from "react";
import Bubble, { BubbleData } from "./Bubble";

type Props = {
  playing: boolean;
  onScore: (points: number, bubble?: { x: number; y: number }) => void;
  spawnRate?: number; // ms between spawn attempts
  driftInterval?: number;
  upwardBias?: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function GameArea({ playing, onScore, spawnRate = 650, driftInterval = 220, upwardBias = 0.45 }: Props) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const idCounter = useRef(0);
  const spawnTimer = useRef<number | null>(null);
  const driftTimer = useRef<number | null>(null);
  const [bgStep, setBgStep] = useState(0);

  useEffect(() => {
    if (!playing) {
      setBubbles([]);
      setBgStep(0);
      return;
    }

    // Spawn loop
    spawnTimer.current = window.setInterval(() => {
      const typeRoll = Math.random();
      let points = 1;
      let size = Math.round(rand(36, 64));
      let color = "#4aa3ff";

      if (typeRoll > 0.92) {
        points = 5;
        size = 46;
        color = "#ffd166";
      } else if (typeRoll > 0.75) {
        points = 3;
        size = 54;
        color = "#9b5de5";
      } else {
        points = 1;
        size = 44;
        color = "#4aa3ff";
      }

      // spawn near bottom-ish so they have space to rise
      const newBubble: BubbleData = {
        id: String(idCounter.current++),
        x: rand(8, 92), // percent
        y: rand(60, 92), // start lower so upward float is visible
        size,
        points,
        color,
      };

      // Before adding, check for overlap with existing bubbles
      const willOverlap = bubbles.some((b) => {
        const dx = b.x - newBubble.x;
        const dy = b.y - newBubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Convert percent to px (approximate)
        const pxDist = dist * 5.2; // 100% ~ 520px
        return pxDist < (b.size + newBubble.size) / 2;
      });
      if (willOverlap) return; // skip spawn if would overlap
      setBubbles((s) => [...s, newBubble]);

      // auto remove bubble after lifetime if not popped
      const lifetime = 7000; // shortened so faster-floating bubbles leave sooner
      window.setTimeout(() => {
        setBubbles((curr) => curr.filter((b) => b.id !== newBubble.id));
      }, lifetime);
    }, spawnRate);

    // Drift loop: nudge bubbles around and add upward bias
    // run more frequently for smoother movement and faster float
    driftTimer.current = window.setInterval(() => {
      setBubbles((curr) => {
        // First, move bubbles
        let moved = curr.map((b, i, arr) => {
          const mag = Math.max(0.35, 3 - b.size / 30);
          let dx = rand(-mag, mag);
          let dy = rand(-mag, mag);
          dy -= upwardBias;
          let nx = b.x + dx;
          let ny = b.y + dy;

          // Edge bounce
          const pad = Math.min(12 + b.size / 8, 30);
          if (nx < pad) { nx = pad; dx = -dx; }
          if (nx > 100 - pad) { nx = 100 - pad; dx = -dx; }
          if (ny < pad) { ny = pad; dy = -dy; }
          if (ny > 100 - pad) { ny = 100 - pad; dy = -dy; }

          return { ...b, x: nx, y: ny, dx, dy };
        });

        // Bubble-bubble bounce
        for (let i = 0; i < moved.length; i++) {
          for (let j = i + 1; j < moved.length; j++) {
            const a = moved[i];
            const b = moved[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pxDist = dist * 5.2;
            const minDist = (a.size + b.size) / 2;
            if (pxDist < minDist) {
              // Bounce: push apart
              const angle = Math.atan2(dy, dx);
              const push = (minDist - pxDist) / 5.2;
              moved[i].x += Math.cos(angle) * push;
              moved[i].y += Math.sin(angle) * push;
              moved[j].x -= Math.cos(angle) * push;
              moved[j].y -= Math.sin(angle) * push;
              // Clamp to bounds
              const padA = Math.min(12 + a.size / 8, 30);
              const padB = Math.min(12 + b.size / 8, 30);
              moved[i].x = Math.max(padA, Math.min(100 - padA, moved[i].x));
              moved[i].y = Math.max(padA, Math.min(100 - padA, moved[i].y));
              moved[j].x = Math.max(padB, Math.min(100 - padB, moved[j].x));
              moved[j].y = Math.max(padB, Math.min(100 - padB, moved[j].y));
            }
          }
        }

        // Remove bubbles that float off top
        return moved.filter((b) => b.y > 6);
      });
    }, driftInterval); // update position more frequently so Bubble's CSS transition animates it

    // Animate background gradient
    const bgTimer = window.setInterval(() => {
      setBgStep((s) => (s + 1) % 360);
    }, 120);

    return () => {
      if (spawnTimer.current) window.clearInterval(spawnTimer.current);
      if (driftTimer.current) window.clearInterval(driftTimer.current);
      window.clearInterval(bgTimer);
    };
  }, [playing, spawnRate, driftInterval, upwardBias]);

  // Called by Bubble AFTER its pop animation finishes
  function handlePop(id: string, points: number) {
    // award points immediately
    const popped = bubbles.find((b) => b.id === id);
    if (popped) {
      onScore(points, { x: popped.x, y: popped.y });
    } else {
      onScore(points);
    }
    // remove bubble
    setBubbles((curr) => curr.filter((b) => b.id !== id));
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 920,
        height: 520,
        borderRadius: 12,
        border: "2px solid #e6eefc",
        background:
          `linear-gradient(180deg, hsl(${bgStep}, 80%, 85%) 0%, hsl(${(bgStep+60)%360}, 90%, 70%) 100%)`,
        position: "relative",
        overflow: "hidden",
        marginTop: "1.25rem",
        transition: "background 0.8s linear"
      }}
    >
      {/* Bubbles */}
      {bubbles.map((b) => (
        <Bubble key={b.id} bubble={b} onPop={handlePop} />
      ))}

      {/* Overlay when not playing */}
      {!playing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: 18,
            pointerEvents: "none",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          Hit Play to start popping drifting bubbles!
        </div>
      )}
    </div>
  );
}
