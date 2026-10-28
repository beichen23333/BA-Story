import React, { useRef, useState } from "react";
export function ClubStoryCard({ story, index = 0, onSelect, onClickSound }) {
  const [bouncing, setBouncing] = useState(false);
  const lock = useRef(false);
  const click = () => { if (lock.current) return; lock.current = true; onClickSound?.(); setBouncing(true); };
  const finish = (event) => { if (event.animationName !== "clubStoryBounce") return; setBouncing(false); lock.current = false; onSelect?.(story); };
  const handleKeyDown = (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); click(); } };
  return <article className={`club-story-card ${bouncing ? "club-story-card-bounce" : ""}`} style={{ "--card-index": index }} onClick={click} onKeyDown={handleKeyDown} onAnimationEnd={finish} role="button" tabIndex={0} aria-label={story.title}><img className="club-story-image" src={story.image} alt={`${story.title}`} draggable="false" /><div className="club-story-copy"><h2 className="club-story-title">{story.title}</h2><p className="club-story-description">{story.description}</p></div></article>;
}
