// components/BubblePopperHeading.tsx
import React from "react";

export default function BubblePopperHeading(): JSX.Element {
  return (
    <h1
      style={{
        fontSize: "5rem",
        textAlign: "center",
        marginTop: "3.5rem",
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
        background: "linear-gradient(90deg, #ffd966, #ff6b6b)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "0.03em",
        marginBottom: "1rem",
      }}
    >
      Bubble Popper Game
    </h1>
  );
}
