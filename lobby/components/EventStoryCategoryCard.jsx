import React, { useRef, useState, useEffect } from "react";
import { replaceUserNameText } from "../../shared/utils.ts";
export function EventStoryCategoryCard({ story, index = 0, onSelect, onClickSound, userName = "sensei" }) {
  const displayTitle = replaceUserNameText(story.title, userName);
  const [bouncing, setBouncing] = useState(false);
  const lock = useRef(false);
  const selectTimer = useRef(null);
  useEffect(() => () => { if (selectTimer.current) window.clearTimeout(selectTimer.current); }, []);
  const click = () => {
    if (lock.current) return;
    lock.current = true;
    onClickSound?.();
    setBouncing(true);
    selectTimer.current = window.setTimeout(() => {
      selectTimer.current = null;
      setBouncing(false);
      lock.current = false;
      onSelect?.(story);
    }, 440);
  };
  const handleKeyDown = (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); click(); } };
  return <article className={`story-list-card event-story-list-card ${bouncing ? "story-list-card-bounce" : ""}`} style={{ "--card-index": index }} onClick={click} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label={displayTitle}>
    <div className="event-story-list-visual">
      <img className="event-story-list-background" src="./assets/Growth_Bg.png" alt="" draggable="false" />
      <img className="event-story-list-image" src={story.image} alt={displayTitle} draggable="false" />
    </div>
    <div className="event-story-list-copy">
      <h2 className="story-list-title event-story-list-title">{displayTitle}</h2>
    </div>
  </article>;
}
