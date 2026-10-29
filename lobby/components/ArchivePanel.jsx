import React, { useEffect, useRef, useState } from "react";
import { resourceUrl } from "../../public/utils.ts";

const ARCHIVE_CARDS = [
  { key: "archiveFavor", image: "Replay_Favor.png" },
  { key: "archiveWork", image: "Replay_Work.png" },
  { key: "archiveEvent", image: "Replay_Event.png" },
];

export function ArchivePanel({ t, onSelect }) {
  const [bouncingKey, setBouncingKey] = useState("");
  const selectionTimer = useRef(null);
  const selectedKey = useRef("");
  useEffect(() => () => {
    if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
  }, []);
  const finishSelection = (key) => {
    if (!key || selectedKey.current !== key) return;
    selectedKey.current = "";
    if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
    selectionTimer.current = null;
    setBouncingKey("");
    onSelect(key);
  };
  const handleSelect = (key) => {
    if (selectedKey.current) return;
    selectedKey.current = key;
    setBouncingKey("");
    requestAnimationFrame(() => {
      setBouncingKey(key);
      // 动画事件用于正常完成；计时器作为兜底，避免动画名称或浏览器事件导致卡死。
      selectionTimer.current = window.setTimeout(() => finishSelection(key), 460);
    });
  };
  return <section className="archive-panel" aria-label={t.archiveTitle}>
    {ARCHIVE_CARDS.map((card) => <button className={`archive-replay-card ${bouncingKey === card.key ? "archive-replay-card-bounce" : ""}`} type="button" key={card.key} onClick={() => handleSelect(card.key)} onAnimationEnd={(event) => { if (event.animationName === "storyCardBounce" && bouncingKey === card.key) finishSelection(card.key); }}>
      <div className="archive-replay-image"><img src={resourceUrl("scenarioMode", card.image)} alt="" draggable="false" /></div>
      <div className="archive-replay-title">{t[`${card.key}Title`]}</div>
      <div className="archive-replay-description">{t[`${card.key}Description`]}</div>
    </button>)}
  </section>;
}
