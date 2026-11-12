import React from "react";
import { replaceUserNameText } from "../../shared/utils.ts";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";

export function EventStoryCategoryCard({ story, index = 0, onSelect, onClickSound, userName = "sensei" }) {
  const displayTitle = replaceUserNameText(story.title, userName);
  const { trigger, handleKeyDown, isBouncing } = useStoryCardTouch(onSelect, onClickSound);
  return <article className={`story-list-card event-story-list-card ${isBouncing(story) ? "story-list-card-bounce" : ""}`} style={{ "--card-index": index }} onClick={() => trigger(story)} onKeyDown={(event) => handleKeyDown(event, story)} role="button" tabIndex={0} aria-label={displayTitle}>
    <div className="event-story-list-visual">
      <img className="event-story-list-background" src="./assets/Growth_Bg.png" alt="" draggable="false" />
      <img className="event-story-list-image" src={story.image} alt={displayTitle} draggable="false" />
    </div>
    <div className="event-story-list-copy">
      <h2 className="story-list-title event-story-list-title">{displayTitle}</h2>
    </div>
  </article>;
}
