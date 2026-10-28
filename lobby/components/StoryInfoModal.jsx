import React, { useEffect } from "react";
const blueButton = "/assets/CCG_Img_BtnBlue.png";
import { TEXT } from "../../public/texts.js";
import "../styles/story-info-modal.css";

export function StoryInfoModal({ story, episode, language = "cn", onClose, onEnter }) {
  const t = TEXT[language] || TEXT.cn;

  useEffect(() => {
    if (!story || !episode) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [story, episode, onClose]);

  if (!story || !episode) return null;

  const episodeNumber = String(episode.number ?? episode.id ?? 1).padStart(2, "0");

  return <div className="story-info-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <section className="story-info-modal" role="dialog" aria-modal="true" aria-labelledby="story-info-title">
      <header className="story-info-header">
        <h2 id="story-info-title">{t.storyInfoTitle}</h2>
        <button className="story-info-close" type="button" onClick={onClose} aria-label={t.close}>×</button>
      </header>
      <div className="story-info-body">
        <div className="story-info-episode-title"><span>{episodeNumber}</span><span className="story-info-separator">｜</span><span>{episode.title || story.title}</span></div>
        <h3 className="club-detail-episodes-heading story-info-reward-heading">{t.episodeSummaryTitle || t.storyRewards}</h3>
        <p className="story-info-reward-copy">{episode.description || t.storyRewardsComplete}</p>
        <button className="story-info-enter" type="button" onClick={() => onEnter?.(story, episode)}>
          <img src={blueButton} alt="" draggable="false" />
          <span>{t.enterStory}</span>
        </button>
      </div>
    </section>
  </div>;
}
