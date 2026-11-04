import React, { useRef, useState, useEffect } from "react";
import { replaceUserNameText } from "../../public/utils.ts";
export function StoryCategoryCard({ story, index = 0, onSelect, onClickSound, userName = "sensei", storyType = "club" }) {
  const displayTitle = replaceUserNameText(story.title, userName);
  const displayDescription = replaceUserNameText(story.description, userName);
  const [bouncing, setBouncing] = useState(false);
  const lock = useRef(false);
  const selectTimer = useRef(null);
  useEffect(() => () => { if (selectTimer.current) window.clearTimeout(selectTimer.current); }, []);
  const click = () => {
    if (lock.current) return;
    lock.current = true;
    onClickSound?.();
    setBouncing(true);
    // 选中流程由独立计时器驱动，不再依赖 animationend，避免某些样式/设备下只播放动画、不进入详情。
    selectTimer.current = window.setTimeout(() => {
      selectTimer.current = null;
      setBouncing(false);
      lock.current = false;
      onSelect?.(story);
    }, 440);
  };
  const handleKeyDown = (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); click(); } };
  return <article className={`story-list-card ${storyType === "work" ? "work-story-list-card" : ""} ${bouncing ? "story-list-card-bounce" : ""}`} style={{ "--card-index": index }} onClick={click} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label={displayTitle}><img className="story-list-image" src={story.image} alt={displayTitle} draggable="false" /><div className="story-list-copy"><h2 className="story-list-title">{displayTitle}</h2><p className="story-list-description">{displayDescription}</p></div></article>;
}
