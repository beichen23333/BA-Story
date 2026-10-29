import React, { useEffect, useState } from "react";
import { getClubStoryPage } from "../components/ClubStories";
import { getMiniStoryPage } from "../components/MiniStories";
import { TEXT } from "../../public/texts.js";
import { subChapterAsset, asset } from "../../public/utils.ts";
const fileIcon = "/assets/file.png";
const blueButton = "/assets/CCG_Img_BtnBlue.png";
import "../styles/club-story-detail.css";

function localizeEpisode(episode, index, language, title) {
  if (typeof episode === "string") return { id: index, title: episode };
  const episodeTitle = episode?.title;
  return { ...episode, id: episode?.id ?? index + 1, title: typeof episodeTitle === "string" ? episodeTitle : TEXT[language].episodeFallback.replace("{title}", title).replace("{number}", index + 1) };
}

export function ClubStoryDetail({ story, pageIndex = 0, language = "cn", onBack, onEpisodeSelect, isMini = false }) {
  const t = TEXT[language] || TEXT.cn;
  const allStories = isMini ? getMiniStoryPage(pageIndex, language) : getClubStoryPage(pageIndex, language);
  const current = story ? allStories.find((item) => item.id === story.id) || story : null;
  const [coverState, setCoverState] = useState("loading");
  useEffect(() => { setCoverState("loading"); }, [current?.id, current?.volume]);
  const coverUrl = current ? (isMini ? asset(`mode/Mini_Chapter_${current.volume}_1.png`) : subChapterAsset(current.volume)) : "";
  const episodes = current ? (Array.isArray(current.episodes) ? current.episodes : [{ id: 1, title: current.title }]).map((episode, index) => localizeEpisode(episode, index, language, current.title)).sort((a, b) => Number(b.number ?? b.id) - Number(a.number ?? a.id)) : [];
  return <section className="club-detail-layout" aria-label={t.clubDetailTitle}>
    <article className="club-detail-cover">
      <header className="club-detail-cover-title">{current ? <><span className="club-detail-cover-title-main">{t.chapterPrefix.replace("{number}", "01")}</span><span className="club-detail-title-separator">｜</span><span className="club-detail-cover-title-name">{current.title}</span></> : t.invalidStory}</header>
      <div className="club-detail-art-wrap">
        {coverUrl && <img key={coverUrl} className="club-detail-art" src={coverUrl} alt={current?.title || ""} onLoad={() => setCoverState("loaded")} onError={() => setCoverState("error")} draggable="false" />}
        {coverState !== "loaded" && <div className="club-detail-cover-placeholder">{coverState === "error" || !coverUrl ? t.coverUnavailable : ""}</div>}
      </div>
      <p className="club-detail-description">{current?.description || t.invalidStory}</p>
    </article>
    <section className="club-detail-episodes">
      <h2 className="club-detail-episodes-heading">{t.selectStory}</h2>
      <p className="club-detail-episodes-note">{t.episodeComplete}</p>
      <div className="club-detail-episode-scroll">
        {episodes.length ? episodes.map((episode, index) => <article className="club-detail-episode" key={`${episode.id}-${index}`}>
          <div className="club-detail-episode-index"><div className="club-detail-episode-number">{String(episode.number ?? episode.id ?? index + 1).padStart(2, "0")}</div><img className="club-detail-file-icon" src={fileIcon} alt="" draggable="false" /></div>
          <div className="club-detail-episode-title" title={episode.title}>{episode.title}</div>
          <button className="club-detail-enter" type="button" onClick={() => onEpisodeSelect?.(current, episode)}>
            <img src={blueButton} alt="" draggable="false" />
            <span>{t.enterEpisode}</span>
          </button>
        </article>) : <p className="club-detail-empty">{t.noEpisodes}</p>}
      </div>
    </section>
  </section>;
}
