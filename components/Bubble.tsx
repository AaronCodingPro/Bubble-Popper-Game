// components/Bubble.tsx
import React, { useEffect, useState } from "react";

export type BubbleData = {
  id: string;
  x: number;
  y: number;
  size: number;
  points: number;
  color?: string;
  poison?: boolean;
};

type Props = {
  bubble: BubbleData;
  onPop: (id: string, points: number, poison?: boolean) => void;
};

export default function Bubble({ bubble, onPop }: Props): JSX.Element {
  const { id, x, y, size, color, poison } = bubble;
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup if unmounted while a pop timeout is active
    };
  }, []);

  function handleClick() {
    if (isPopping) return;
    setIsPopping(true);
    // Play pop sound
    const popAudio = new window.Audio('/pop.mp3');
    popAudio.play();
    window.setTimeout(() => {
      onPop(id, bubble.points, poison);
    }, 320);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%,-50%) ${isPopping ? "scale(0.18)" : "scale(1)"}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: poison ? "0 0 0 6px #ff222244, 0 10px 22px rgba(0,0,0,0.12)" : "0 10px 22px rgba(0,0,0,0.12)",
        fontWeight: 800,
        color: "#fff",
        fontSize: Math.max(12, Math.floor(size / 6)),
        background: color ?? "#4aa3ff",
        border: poison ? "4px solid #ff2222" : undefined,
        transition:
          "left 220ms linear, top 220ms linear, transform 320ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease, border-color 220ms",
        willChange: "left, top, transform, opacity",
        opacity: isPopping ? 0 : 1,
        pointerEvents: isPopping ? "none" : "auto",
        filter: poison ? "drop-shadow(0 0 8px #ff2222)" : undefined,
        animation: poison && isPopping ? "shake 0.32s" : undefined,
      }}
      aria-label={`bubble-${id}${poison ? '-poison' : ''}`}
      title={poison ? 'Poison Bubble! Game Over if clicked.' : undefined}
    >
      {poison ? '💀' : bubble.points}
    </div>
  );
}
