// components/Bubble.tsx
import React, { useEffect, useState } from "react";

export type BubbleData = {
  id: string;
  x: number; // percent (0-100)
  y: number; // percent (0-100)
  size: number; // px diameter
  points: number;
  color?: string;
};

type Props = {
  bubble: BubbleData;
  /**
   * Called when the pop animation finishes and the bubble should be removed + scored.
   * We call this AFTER playing the pop animation so the user sees the visual feedback.
   */
  onPop: (id: string, points: number) => void;
};

export default function Bubble({ bubble, onPop }: Props): JSX.Element {
  const { id, x, y, size, color } = bubble;
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup if unmounted while a pop timeout is active
    };
  }, []);

  function handleClick() {
    if (isPopping) return; // ignore double clicks
    setIsPopping(true);

    // Wait for the pop animation to finish before notifying parent.
    // Keep this in sync with the CSS transition below (300ms).
    window.setTimeout(() => {
      onPop(id, bubble.points);
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
        boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
        fontWeight: 800,
        color: "#fff",
        fontSize: Math.max(12, Math.floor(size / 6)),
        background: color ?? "#4aa3ff",
        transition:
          "left 220ms linear, top 220ms linear, transform 320ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease",
        willChange: "left, top, transform, opacity",
        opacity: isPopping ? 0 : 1,
        pointerEvents: isPopping ? "none" : "auto",
      }}
      aria-label={`bubble-${id}`}
    >
      {bubble.points}
    </div>
  );
}
