import React from "react";

export default function HealthScoreGauge({ score = 0, size = "medium" }) {
  const sizes = {
    small: { width: 80, height: 80, strokeWidth: 8, fontSize: "text-lg" },
    medium: { width: 120, height: 120, strokeWidth: 10, fontSize: "text-2xl" },
    large: { width: 160, height: 160, strokeWidth: 12, fontSize: "text-3xl" }
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 80) return "#28A745";
    if (score >= 60) return "#FFC107";
    if (score >= 40) return "#FF6B35";
    return "#DC3545";
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={height} className="transform -rotate-90">
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${fontSize} font-bold`} style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  );
}