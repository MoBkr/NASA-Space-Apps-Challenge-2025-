import React from "react";

const RocketAnimation = () => (
  <div className="w-64 h-64 mx-auto">
    <svg
      width="256"
      height="256"
      viewBox="0 0 100 100"
      className="animate-bounce"
    >
      {/* Rocket body */}
      <path
        d="M50 20 L60 40 L40 40 Z"
        fill="#4fd1c7"
        stroke="#06b6d4"
        strokeWidth="1"
      />
      <rect
        x="45"
        y="40"
        width="10"
        height="30"
        fill="#4fd1c7"
        stroke="#06b6d4"
        strokeWidth="1"
      />

      {/* Rocket fins */}
      <path
        d="M40 40 L30 50 L40 50 Z"
        fill="#4fd1c7"
        stroke="#06b6d4"
        strokeWidth="1"
      />
      <path
        d="M60 40 L70 50 L60 50 Z"
        fill="#4fd1c7"
        stroke="#06b6d4"
        strokeWidth="1"
      />

      {/* Rocket window */}
      <circle cx="50" cy="50" r="4" fill="#06b6d4" />

      {/* Rocket exhaust */}
      <path d="M45 70 L40 80 L60 80 L55 70 Z" fill="#f59e0b" />
      <path d="M47 70 L45 75 L55 75 L53 70 Z" fill="#f97316" />

      {/* Motion lines */}
      <path
        d="M50 85 L50 95"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="2,2"
      />
      <path
        d="M45 83 L43 93"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="2,2"
      />
      <path
        d="M55 83 L57 93"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="2,2"
      />
    </svg>
  </div>
);

export default RocketAnimation;
