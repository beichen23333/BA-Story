import React from "react";
import { getResourcesUrl } from "../../shared/utils.ts";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";

const ARCHIVE_CARDS = [
  { key: "archiveFavor", image: "Replay_Favor.png" },
  { key: "archiveWork", image: "Replay_Work.png" },
  { key: "archiveEvent", image: "Replay_Event.png" },
];

export function ArchivePanel({ t, onSelect }) {
  const { trigger, isBouncing } = useStoryCardTouch(onSelect, null, 440);
  return <section className="archive-panel" aria-label={t.archiveTitle}>
    {ARCHIVE_CARDS.map((card) => <button className={`archive-replay-card ${isBouncing(card.key) ? "story-list-card-bounce" : ""}`} type="button" key={card.key} onClick={() => trigger(card.key)}>
      <div className="archive-replay-image"><img src={getResourcesUrl("scenarioMode", card.image)} alt="" draggable="false" /></div>
      <div className="archive-replay-title">{t[`${card.key}Title`]}</div>
      <div className="archive-replay-description">{t[`${card.key}Description`]}</div>
    </button>)}
  </section>;
}
