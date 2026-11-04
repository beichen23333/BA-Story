import React, { useEffect, useState } from "react";
import { getClubStoryPage } from "../stories/ClubStories.js";
import { getMiniStoryPage } from "../stories/MiniStories.js";
import { getWorkStoryPage } from "../stories/WorkStories.js";
import { getEventStoryPage } from "../stories/EventStories.js";
import { TEXT } from "../../public/texts.js";
import { getResourcesUrl, replaceUserNameText } from "../../public/utils.ts";
const fileIcon = "./assets/file.png";
const blueButton = "./assets/CCG_Img_BtnBlue.png";
import "../styles/story-detail.css";

function localizeEpisode(episode, index, language, title, userName) {
  if (typeof episode === "string") return { id: index, title: replaceUserNameText(episode, userName) };
  const episodeTitle = episode?.title;
  const fallbackTitle = TEXT[language].episodeFallback.replace("{title}", title).replace("{number}", index + 1);
  const originalTitle = typeof episodeTitle === "string" ? episodeTitle : fallbackTitle;
  const selectionTitle = typeof episode?.selectionTitle === "string" ? episode.selectionTitle : originalTitle;
  return { ...episode, id: episode?.id ?? index + 1, title: replaceUserNameText(originalTitle, userName), selectionTitle: replaceUserNameText(selectionTitle, userName), description: replaceUserNameText(episode?.description, userName) };
}

export function StoryDetailPanel({ story, pageIndex = 0, language = "cn", onBack, onEpisodeSelect, storyType = "club", userName = "sensei" }) {
  const t = TEXT[language] || TEXT.cn;
  const directEpisodeEntry = storyType === "work" || storyType === "event";
  const pageLoaders = { club: getClubStoryPage, mini: getMiniStoryPage, work: getWorkStoryPage, event: getEventStoryPage };
  const allStories = (pageLoaders[storyType] || getClubStoryPage)(pageIndex, language);
  const current = story ? allStories.find((item) => item.id === story.id) || story : null;
  const displayTitle = current ? replaceUserNameText(current.title, userName) : t.invalidStory;
  const displayDescription = current ? replaceUserNameText(current.description, userName) : t.invalidStory;
  const [coverState, setCoverState] = useState("loading");
  useEffect(() => { setCoverState("loading"); }, [current?.id, current?.volume]);
  const coverUrl = current ? (storyType === "event" ? getResourcesUrl("eventScenario", `Event_Image_${current.id}.png`) : storyType === "work" ? getResourcesUrl("scenarioMode", `Replay_Contents_${current.id}_EpisodeSelect.png`) : storyType === "mini" ? getResourcesUrl("scenarioMode", `Mini_Chapter_${current.volume}_1.png`) : getResourcesUrl("scenarioMode", `Sub_Chapter_${current.volume}_1.png`)) : "";
  const episodeSource = current ? (Array.isArray(current.episodes) ? current.episodes : storyType === "work" ? [] : [{ id: 1, title: current.title }]) : [];
  const episodes = episodeSource.map((episode, index) => localizeEpisode(episode, index, language, displayTitle, userName)).sort((a, b) => Number(b.number ?? b.id) - Number(a.number ?? a.id));
  return <section className="story-detail-layout" aria-label={storyType === "work" || storyType === "event" ? t.archiveTitle : t.clubDetailTitle}>
    <article className="story-detail-cover">
      <header className="story-detail-cover-title">{current ? <>{storyType !== "work" && storyType !== "event" && <><span className="story-detail-cover-title-main">{t.chapterPrefix.replace("{number}", String(current.volume ?? 1))}</span><span className="story-detail-title-separator">｜</span></>}<span className="story-detail-cover-title-name">{displayTitle}</span></> : t.invalidStory}</header>
      <div className="story-detail-art-wrap">
        {coverUrl && <img key={coverUrl} className="story-detail-art" src={coverUrl} alt={displayTitle} onLoad={() => setCoverState("loaded")} onError={() => setCoverState("error")} draggable="false" />}
        {coverState !== "loaded" && <div className="story-detail-cover-placeholder">{coverState === "error" || !coverUrl ? t.coverUnavailable : ""}</div>}
      </div>
      <p className="story-detail-description">{displayDescription || t.invalidStory}</p>
    </article>
    <section className={`story-detail-episodes ${directEpisodeEntry ? "story-detail-episodes-direct" : ""}`}>
      <h2 className="story-detail-episodes-heading">{t.selectStory}</h2>
      <p className={`story-detail-episodes-note ${directEpisodeEntry ? "story-detail-episodes-note-hidden" : ""}`}>{t.episodeComplete}</p>
      <div className="story-detail-episode-scroll">
        {episodes.length ? episodes.map((episode, index) => <article className="story-detail-episode" key={`${episode.id}-${index}`}>
          {!directEpisodeEntry && <div className="story-detail-episode-index"><div className="story-detail-episode-number">{String(episode.number ?? episode.id ?? index + 1).padStart(2, "0")}</div><img className="story-detail-file-icon" src={fileIcon} alt="" draggable="false" /></div>}
          <div className="story-detail-episode-title" title={episode.selectionTitle || episode.title}>{episode.selectionTitle || episode.title}</div>
          <button className="story-detail-enter" type="button" onClick={() => onEpisodeSelect?.(current, episode)}>
            <img src={blueButton} alt="" draggable="false" />
            <span>{t.enterEpisode}</span>
          </button>
        </article>) : <p className="story-detail-empty">{t.noEpisodes}</p>}
      </div>
    </section>
  </section>;
}
