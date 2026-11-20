import React from "react";
// import "./Stars.css";

const Stars = ({ count = 50 }) => {
  const starsArray = Array.from({ length: count });

  return (
    <div className="stars-container">
      {starsArray.map((_, index) => {
        const x = Math.random();
        const y = Math.random();
        const delay = Math.random() * 3; // Random delay (0–3s)
        const duration = 1 + Math.random() * 2; // Duration between 1–3s

        return (
          <div
            key={index}
            className="star"
            style={{
            // @ts-ignore
              "--x": x,
              "--y": y,
              "--delay": `${delay}s`,
              "--duration": `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Stars;
