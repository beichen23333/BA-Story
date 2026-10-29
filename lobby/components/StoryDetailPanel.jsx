import React, { useEffect, useState } from "react";
import { getClubStoryPage } from "../stories/ClubStories.js";
import { getMiniStoryPage } from "../stories/MiniStories.js";
import { getWorkStoryPage } from "../stories/WorkStories.js";
import { TEXT } from "../../public/texts.js";
import { subChapterAsset, asset } from "../../public/utils.ts";
const fileIcon = "/assets/file.png";
const blueButton = "/assets/CCG_Img_BtnBlue.png";
import "../styles/story-detail.css";

function localizeEpisode(episode, index, language, title) {
  if (typeof episode === "string") return { id: index, title: episode };
  const episodeTitle = episode?.title;
  return { ...episode, id: episode?.id ?? index + 1, title: typeof episodeTitle === "string" ? episodeTitle : TEXT[language].episodeFallback.replace("{title}", title).replace("{number}", index + 1) };
}

export function StoryDetailPanel({ story, pageIndex = 0, language = "cn", onBack, onEpisodeSelect, storyType = "club" }) {
  const t = TEXT[language] || TEXT.cn;
  const pageLoaders = { club: getClubStoryPage, mini: getMiniStoryPage, work: getWorkStoryPage };
  const allStories = (pageLoaders[storyType] || getClubStoryPage)(pageIndex, language);
  const current = story ? allStories.find((item) => item.id === story.id) || story : null;
  const [coverState, setCoverState] = useState("loading");
  useEffect(() => { setCoverState("loading"); }, [current?.id, current?.volume]);
  const coverUrl = current ? (storyType === "work" ? asset(`mode/Replay_Contents_${current.id}_EpisodeSelect.png`) : storyType === "mini" ? asset(`mode/Mini_Chapter_${current.volume}_1.png`) : subChapterAsset(current.volume)) : "";
  const episodeSource = current ? (Array.isArray(current.episodes) ? current.episodes : storyType === "work" ? [] : [{ id: 1, title: current.title }]) : [];
  const episodes = episodeSource.map((episode, index) => localizeEpisode(episode, index, language, current.title)).sort((a, b) => Number(b.number ?? b.id) - Number(a.number ?? a.id));
  return <section className="story-detail-layout" aria-label={storyType === "work" ? t.archiveTitle : t.clubDetailTitle}>
    <article className="story-detail-cover">
      <header className="story-detail-cover-title">{current ? <><span className="story-detail-cover-title-main">{t.chapterPrefix.replace("{number}", "01")}</span><span className="story-detail-title-separator">｜</span><span className="story-detail-cover-title-name">{current.title}</span></> : t.invalidStory}</header>
      <div className="story-detail-art-wrap">
        {coverUrl && <img key={coverUrl} className="story-detail-art" src={coverUrl} alt={current?.title || ""} onLoad={() => setCoverState("loaded")} onError={() => setCoverState("error")} draggable="false" />}
        {coverState !== "loaded" && <div className="story-detail-cover-placeholder">{coverState === "error" || !coverUrl ? t.coverUnavailable : ""}</div>}
      </div>
      <p className="story-detail-description">{current?.description || t.invalidStory}</p>
    </article>
    <section className="story-detail-episodes">
      <h2 className="story-detail-episodes-heading">{t.selectStory}</h2>
      <p className="story-detail-episodes-note">{t.episodeComplete}</p>
      <div className="story-detail-episode-scroll">
        {episodes.length ? episodes.map((episode, index) => <article className="story-detail-episode" key={`${episode.id}-${index}`}>
          <div className="story-detail-episode-index"><div className="story-detail-episode-number">{String(episode.number ?? episode.id ?? index + 1).padStart(2, "0")}</div><img className="story-detail-file-icon" src={fileIcon} alt="" draggable="false" /></div>
          <div className="story-detail-episode-title" title={episode.title}>{episode.title}</div>
          <button className="story-detail-enter" type="button" onClick={() => onEpisodeSelect?.(current, episode)}>
            <img src={blueButton} alt="" draggable="false" />
            <span>{t.enterEpisode}</span>
          </button>
        </article>) : <p className="story-detail-empty">{t.noEpisodes}</p>}
      </div>
    </section>
  </section>;
}
