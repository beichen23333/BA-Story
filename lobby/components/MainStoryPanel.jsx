import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getFinalStoryVolume, getMainStoryVolumes } from "../stories/MainStories.js";
import { MAIN_STORY_UI_TEXTS } from "../../shared/texts/maintexts.js";
import { MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
import { MainStoryVolumeCard } from "./MainStoryVolumeCard.jsx";
import { MainStoryChapterPanel } from "./MainStoryChapterPanel.jsx";
import "../styles/main-story.css";

export function MainStoryPanel({ language, backLabel, onBack, onPartTwo, onPartOne, onClickSound, series = 1 }) {
    const seriesId = Number(series) === 2 ? 2 : 1;
    const defaultVolumeId = seriesId === 2 ? "series2-prologue" : "main-1";
    const volumes = useMemo(() => getMainStoryVolumes(language, seriesId).map((volume) => ({
        ...volume,
        chapterBackgroundUrl: MAIN_STORY_RESOURCES.chapterBackground()
    })), [language, seriesId]);
    const finalVolume = useMemo(() => ({
        ...getFinalStoryVolume(language),
        backgroundImageUrl: MAIN_STORY_RESOURCES.finalVolumeBackground(),
        chapterBackgroundUrl: MAIN_STORY_RESOURCES.finalChapterBackground()
    }), [language]);
    const [selectedVolumeId, setSelectedVolumeId] = useState(defaultVolumeId);
    const [selectedChapterId, setSelectedChapterId] = useState(seriesId === 2 ? "series2-prologue-chapter-1" : "main-1-chapter-3");
    const [selectedFinalChapterId, setSelectedFinalChapterId] = useState("final-chapter-1");
    const [isFinalPage, setIsFinalPage] = useState(false);
    const [isFinalExiting, setIsFinalExiting] = useState(false);
    const [mainContentVisible, setMainContentVisible] = useState(true);
    const [hasReturnedFromFinal, setHasReturnedFromFinal] = useState(false);
    const [finalBackgroundVisible, setFinalBackgroundVisible] = useState(false);
    const [finalVolumeEntered, setFinalVolumeEntered] = useState(false);
    const railRef = useRef(null);
    const finalReturnTimerRef = useRef(null);
    const lastVolumeIndex = Math.max(0, volumes.length - 1);
    const lastVolumeLeft = volumes.length ? 6.5 + Math.floor(lastVolumeIndex / 2) * 45 + (lastVolumeIndex % 2) * 27 : 0;
    const selectedVolume = volumes.find((volume) => volume.id === selectedVolumeId) || volumes[1] || volumes[0];
    const ui = MAIN_STORY_UI_TEXTS;
    const localeKey = language === "kr" ? "Kr" : language === "cn" || language === "jp" ? "Jp" : null;

    useEffect(() => () => {
        if (finalReturnTimerRef.current) window.clearTimeout(finalReturnTimerRef.current);
    }, []);

    useEffect(() => {
        if (!isFinalPage) return undefined;
        const frameId = window.requestAnimationFrame(() => {
            setFinalBackgroundVisible(true);
            setFinalVolumeEntered(true);
        });
        return () => window.cancelAnimationFrame(frameId);
    }, [isFinalPage]);

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

    const handleFinalChapterOpen = () => {
        setSelectedFinalChapterId("final-chapter-1");
        setHasReturnedFromFinal(false);
        setMainContentVisible(false);
        setIsFinalExiting(false);
        setFinalBackgroundVisible(false);
        setFinalVolumeEntered(false);
        setIsFinalPage(true);
    };

    const handleFinalBack = () => {
        onClickSound?.();
        setIsFinalExiting(true);
        setHasReturnedFromFinal(true);
        setMainContentVisible(false);
        setFinalBackgroundVisible(false);
        setFinalVolumeEntered(false);
        if (finalReturnTimerRef.current) window.clearTimeout(finalReturnTimerRef.current);
        window.requestAnimationFrame(() => setMainContentVisible(true));
        finalReturnTimerRef.current = window.setTimeout(() => {
            setIsFinalPage(false);
            setIsFinalExiting(false);
            setMainContentVisible(true);
            setSelectedVolumeId("main-1");
            setSelectedChapterId("main-1-chapter-3");
            finalReturnTimerRef.current = null;
        }, 740);
    };

    return (
        <section
            className={`main-story-scene ${isFinalPage ? "is-final-story" : ""} ${isFinalExiting ? "is-final-exiting" : ""}`}
            style={{ backgroundImage: `url("${MAIN_STORY_RESOURCES.sceneBackground()}")` }}
        >
            <button className="main-story-back-button story-list-back-button" type="button" onClick={onBack} aria-label={backLabel}>
                <ArrowLeft size={36} strokeWidth={2.4} />
            </button>
            {(!isFinalPage || isFinalExiting) && <div className={`main-story-normal-content ${hasReturnedFromFinal ? "is-returning" : ""} ${mainContentVisible ? "is-visible" : ""}`}>
                <div className="main-story-grid-overlay" aria-hidden="true" />
                <div className="main-story-light-overlay" aria-hidden="true" />
                <div className="main-story-rail" ref={railRef} onWheel={handleRailWheel}>
                    <div className="main-story-track" style={{ "--main-story-last-volume-left": `${lastVolumeLeft}cqw` }}>
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
                {seriesId === 1 ? <button className="main-story-part-two-button" type="button" onClick={onPartTwo}>
                    <img src={MAIN_STORY_RESOURCES.partSwitchIcon()} alt="" draggable="false" />
                    <span>{ui.secondPartSwitch[({ cn: "Cn", en: "En", kr: "Kr", jp: "Jp", tw: "Tw", th: "Th" })[language] || "Cn"]}</span>
                </button> : <button className="main-story-part-two-button is-return" type="button" onClick={onPartOne}>
                    <img src={MAIN_STORY_RESOURCES.partSwitchIcon()} alt="" draggable="false" />
                    <span>{ui.firstPartSwitch[({ cn: "Cn", en: "En", kr: "Kr", jp: "Jp", tw: "Tw", th: "Th" })[language] || "Cn"]}</span>
                </button>}
                <MainStoryChapterPanel
                    volume={selectedVolume}
                    language={language}
                    selectedChapterId={selectedChapterId}
                    onChapterSelect={handleChapterSelect}
                    onClickSound={onClickSound}
                    onFinalChapterClick={seriesId === 1 ? handleFinalChapterOpen : undefined}
                    showFinalChapter={seriesId === 1}
                />
                {seriesId === 1 && <div className="main-story-progress" aria-hidden="true">
                    <span>{ui.episodeClear[localeKey]}</span>
                </div>}
            </div>}
            {isFinalPage && <>
                <div className={`main-story-final-background ${finalBackgroundVisible ? "is-visible" : ""}`} style={{ backgroundImage: `url("${MAIN_STORY_RESOURCES.finalSceneBackground()}")` }} aria-hidden="true" />
                <button className={`main-story-part-two-button is-return main-story-final-return-button ${finalVolumeEntered ? "is-visible" : ""}`} type="button" onClick={handleFinalBack} aria-label={ui.otherStories[({ cn: "Cn", en: "En", kr: "Kr", jp: "Jp", tw: "Tw", th: "Th" })[language] || "Cn"]}>
                    <img src={MAIN_STORY_RESOURCES.partSwitchIcon()} alt="" draggable="false" />
                    <span>{ui.otherStories[({ cn: "Cn", en: "En", kr: "Kr", jp: "Jp", tw: "Tw", th: "Th" })[language] || "Cn"]}</span>
                </button>
                <div className={`main-story-final-volume ${finalVolumeEntered ? "is-visible" : ""} ${isFinalExiting ? "is-exiting" : ""}`}>
                    <MainStoryVolumeCard
                        volume={finalVolume}
                        index={0}
                        selected={false}
                        staticCard
                        centered
                        descriptionBelow
                    />
                </div>
                <div className={`main-story-final-chapters ${finalVolumeEntered ? "is-visible" : ""}`}>
                    <MainStoryChapterPanel
                        volume={finalVolume}
                        language={language}
                        selectedChapterId={selectedFinalChapterId}
                        onChapterSelect={(chapter) => setSelectedFinalChapterId(chapter.id)}
                        onClickSound={onClickSound}
                        onFinalChapterClick={undefined}
                        showFinalChapter={false}
                        showChapterDescription={false}
                    />
                </div>
            </>}
        </section>
    );
}
