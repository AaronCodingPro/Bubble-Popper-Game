// components/BubblePopperHeading.tsx
import React from "react";

export default function BubblePopperHeading(): JSX.Element {
  return (
    <h1
      style={{
        fontSize: "5rem",
        textAlign: "center",
        fontFamily: "Comic Sans MS, Comic Sans, cursive, sans-serif",
        letterSpacing: "0.03em",
        marginBottom: "1rem",
        background: "linear-gradient(to right, #dc2626, #facc15, #ec4899)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      Bubble Popper Game
    </h1>
  );
}
