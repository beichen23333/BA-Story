import React from "react";
import { replaceUserNameText } from "../../shared/utils.ts";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";

export function StoryCategoryCard({ story, index = 0, onSelect, onClickSound, userName = "sensei", storyType = "club" }) {
  const displayTitle = replaceUserNameText(story.title, userName);
  const displayDescription = replaceUserNameText(story.description, userName);
  const { trigger, handleKeyDown, isBouncing } = useStoryCardTouch(onSelect, onClickSound);
  return <article className={`story-list-card ${storyType === "work" ? "work-story-list-card" : ""} ${isBouncing(story) ? "story-list-card-bounce" : ""}`} style={{ "--card-index": index }} onClick={() => trigger(story)} onKeyDown={(event) => handleKeyDown(event, story)} role="button" tabIndex={0} aria-label={displayTitle}><img className="story-list-image" src={story.image} alt={displayTitle} draggable="false" /><div className="story-list-copy"><h2 className="story-list-title">{displayTitle}</h2><p className="story-list-description">{displayDescription}</p></div></article>;
}
