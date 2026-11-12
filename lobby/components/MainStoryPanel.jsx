import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getMainStoryVolumes } from "../stories/MainStories.js";
import { MAIN_STORY_UI_TEXTS } from "../../shared/texts/maintexts.js";
import { MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
import { MainStoryVolumeCard } from "./MainStoryVolumeCard.jsx";
import { MainStoryChapterPanel } from "./MainStoryChapterPanel.jsx";
import "../styles/main-story.css";

export function MainStoryPanel({ language, backLabel, onBack, onPartTwo, onClickSound, series = 1 }) {
    const seriesId = Number(series) === 2 ? 2 : 1;
    const defaultVolumeId = seriesId === 2 ? "series2-prologue" : "main-1";
    const volumes = useMemo(() => getMainStoryVolumes(language, seriesId).map((volume) => ({
        ...volume,
        chapterBackgroundUrl: MAIN_STORY_RESOURCES.chapterBackground()
    })), [language, seriesId]);
    const [selectedVolumeId, setSelectedVolumeId] = useState(defaultVolumeId);
    const [selectedChapterId, setSelectedChapterId] = useState(seriesId === 2 ? "series2-prologue-chapter-1" : "main-1-chapter-3");
    const railRef = useRef(null);
    const lastVolumeIndex = Math.max(0, volumes.length - 1);
    const trackWidth = 6.5 + Math.floor(lastVolumeIndex / 2) * 45 + (lastVolumeIndex % 2) * 27 + 23 + 5;
    const selectedVolume = volumes.find((volume) => volume.id === selectedVolumeId) || volumes[1] || volumes[0];
    const ui = MAIN_STORY_UI_TEXTS;
    const localeKey = language === "kr" ? "Kr" : language === "cn" || language === "jp" ? "Jp" : null;

    const handleVolumeSelect = (volume) => {
        onClickSound?.();
        setSelectedVolumeId(volume.id);
        setSelectedChapterId(volume.chapters.at(-1)?.id || null);
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapterId(chapter.id);
    };

    const handleRailWheel = (event) => {
        const rail = railRef.current;
        if (!rail || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        rail.scrollLeft += event.deltaY;
    };

    return (
        <section
            className="main-story-scene"
            style={{
                backgroundImage: `url("${MAIN_STORY_RESOURCES.sceneBackground()}")`
            }}
        >
            <div className="main-story-grid-overlay" aria-hidden="true" />
            <div className="main-story-light-overlay" aria-hidden="true" />
            <div className="main-story-rail" ref={railRef} onWheel={handleRailWheel}>
                <div className="main-story-track" style={{ width: `calc(${trackWidth}cqw + max(0px, clamp(200px, 23cqw, 300px) - 23cqw))` }}>
                    {volumes.map((volume, index) => (
                        <MainStoryVolumeCard
                            key={volume.id}
                            volume={volume}
                            index={index}
                            selected={selectedVolumeId === volume.id}
                            onSelect={handleVolumeSelect}
                        />
                    ))}
                </div>
            </div>
            <button className="main-story-back-button story-list-back-button" type="button" onClick={onBack} aria-label={backLabel}>
                <ArrowLeft size={36} strokeWidth={2.4} />
            </button>
            {seriesId === 1 && <button className="main-story-part-two-button" type="button" onClick={onPartTwo}>
                <img src={MAIN_STORY_RESOURCES.partTwoSwitchIcon()} alt="" draggable="false" />
                <span>{language === "jp" ? ui.secondPartSwitch.JpDisplay : localeKey ? ui.secondPartSwitch[localeKey] : ""}</span>
            </button>}
            <MainStoryChapterPanel
                volume={selectedVolume}
                language={language}
                selectedChapterId={selectedChapterId}
                onChapterSelect={handleChapterSelect}
                onClickSound={onClickSound}
                showFinalChapter={seriesId === 1}
            />
            <div className="main-story-progress" aria-hidden="true">
                <span>{ui.episodeClear[localeKey]}</span>
            </div>
        </section>
    );
}
