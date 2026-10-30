import React, { useState } from "react";
import { getResourcesUrl } from "../../public/utils.ts";

export function StoryCard({
  className = "",
  image,
  background,
  label,
  subtitle,
  main = false,
  active = false,
  onClick,
  onBounceComplete
}) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      const isEffective = onClick(e);
      // 如果点击处理函数返回明确的 false，则表示非有效点击（如仅切换层级），不触发弹跳
      if (isEffective !== false) {
        setBouncing(false);
        // 通过微小延时触发动画重置
        requestAnimationFrame(() => {
          setBouncing(true);
        });
      }
    }
  };

  return (
    <button
      className={`story-card ${main ? "main-card" : ""} ${className} ${active ? "active" : ""} ${bouncing ? "card-bounce" : ""}`}
      style={{ "--card-background": `url("${getResourcesUrl("ui", background)}")` }}
      onClick={handleClick}
      onAnimationEnd={(event) => { if (event.animationName.includes("Bounce") || event.animationName === "cardBounce") { setBouncing(false); onBounceComplete?.(); } }}
      type="button"
    >
      <img className="card-background" src={getResourcesUrl("ui", background)} alt="" draggable="false" />
      <div className="card-art-wrap">
        <img className="card-art" src={getResourcesUrl("ui", image)} alt="" draggable="false" />
      </div>
      <div className="card-copy">
        <div className="card-label">{label}</div>
        <div className="card-subtitle">{subtitle}</div>
      </div>
    </button>
  );
}
