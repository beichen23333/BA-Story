import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
import { getFinalVolumeChapter1Episodes } from "../stories/FinalVolumeStories.js";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";
import { getDiagonalScrollProgress } from "../utils/storyScroll.js";

export function FinalVolumeChapterStoryPanel({ chapter, chapters, language, onChapterChange, onEpisodeEnter, onClickSound }) {
    const currentIndex = Math.max(0, chapters.findIndex((item) => item.id === chapter?.id));
    const episodes = useMemo(() => chapter?.id === "final-chapter-1" ? getFinalVolumeChapter1Episodes(language) : [], [chapter?.id, language]);
    const listRef = useRef(null);
    const pointerRef = useRef(null);
    const suppressClickRef = useRef(false);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
    const viewportHeight = typeof window === "undefined" ? 715 : window.innerHeight;
    const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
    const rowHeight = Math.min(112, Math.max(82, viewportHeight * 0.158));
    const rowGap = Math.max(5, viewportHeight * 0.009);
    const rowStep = rowHeight + rowGap;
    const stagger = Math.min(39.3, Math.max(30, viewportWidth * 0.02858));
    const [scrollProgress, setScrollProgress] = useState(0);
    const clampScrollProgress = (nextProgress) => {
        const visibleCount = (listRef.current?.clientHeight || viewportHeight * 0.665) / rowStep;
        return Math.max(0, Math.min(Math.max(0, episodes.length - visibleCount), nextProgress));
    };
    const setClampedScrollProgress = (nextProgress) => setScrollProgress(clampScrollProgress(nextProgress));
    const trackTransform = `translate3d(${scrollProgress * stagger}px, ${-scrollProgress * rowStep}px, 0)`;
    const { trigger: triggerEpisode, isBouncing } = useStoryCardTouch(setSelectedEpisodeId, onClickSound);

    useEffect(() => {
        setSelectedEpisodeId(null);
        setScrollProgress(0);
    }, [chapter?.id]);

    const handlePointerDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scrollProgress, moved: false };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const state = pointerRef.current;
        if (!state || state.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - state.x;
        const deltaY = event.clientY - state.y;
        if (!state.moved && Math.hypot(deltaX, deltaY) > 8) state.moved = true;
        if (!state.moved) return;
        const progressDelta = getDiagonalScrollProgress(deltaX, deltaY, stagger, rowStep);
        if (!progressDelta) return;
        event.preventDefault();
        suppressClickRef.current = true;
        setClampedScrollProgress(state.scrollProgress + progressDelta);
    };

    const handlePointerEnd = (event) => {
        const state = pointerRef.current;
        if (state?.pointerId === event.pointerId) {
            if (state.moved) suppressClickRef.current = true;
            pointerRef.current = null;
            if (suppressClickRef.current) window.setTimeout(() => { suppressClickRef.current = false; }, 0);
        }
    };

    const handleWheel = (event) => {
        const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY / rowStep : event.deltaX / stagger;
        if (!dominantDelta) return;
        event.preventDefault();
        setScrollProgress((current) => clampScrollProgress(current + dominantDelta));
    };

    const handleClickCapture = (event) => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
    };

    const moveChapter = (direction) => {
        const nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= chapters.length) return;
        onClickSound?.();
        onChapterChange?.(chapters[nextIndex]);
    };

    const handleEpisodeEnter = (event, episode) => {
        event.stopPropagation();
        onClickSound?.();
        if (onEpisodeEnter) onEpisodeEnter(episode, chapter);
        else setSelectedEpisodeId(episode.id);
    };

    return (
        <section className="final-volume-chapter-story" aria-label={chapter?.title || "Final chapter"}>
            <img className="final-volume-chapter-art" src={MAIN_STORY_RESOURCES.finalChapterImage(chapter?.imageFile || "Main_Chapter_100_1.png")} alt="" loading="eager" decoding="async" draggable="false" />
            <div className="final-volume-chapter-art-shade" aria-hidden="true" />
            <div className="final-volume-chapter-info">
                <div className="final-volume-chapter-heading">
                    <span className="final-volume-chapter-number">第{chapter?.number || currentIndex + 1}章</span>
                    <span className="final-volume-chapter-divider" aria-hidden="true" />
                    <span className="final-volume-chapter-title">{chapter?.title || ""}</span>
                </div>
                <p className="final-volume-chapter-description">{chapter?.description || ""}</p>
            </div>
            {currentIndex > 0 && <button className="story-list-prev-page-button final-volume-chapter-arrow" type="button" onClick={() => moveChapter(-1)} aria-label="上一章"><ChevronLeft size={42} strokeWidth={3} /></button>}
            {currentIndex < chapters.length - 1 && <button className="story-list-next-button final-volume-chapter-arrow" type="button" onClick={() => moveChapter(1)} aria-label="下一章"><ChevronRight size={42} strokeWidth={3} /></button>}
            <div className="final-volume-episode-list" ref={listRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd} onWheel={handleWheel} onClickCapture={handleClickCapture} aria-label="剧情列表">
                {episodes.length ? <div className="final-volume-episode-track" style={{ height: `${episodes.length * rowStep}px`, transform: trackTransform }}>
                    {episodes.map((episode, index) => (
                        <div className="final-volume-episode-row-wrap" key={episode.id} style={{ left: `${-index * stagger}px`, top: `${index * rowStep}px`, height: `${rowHeight}px` }}>
                            <div className={`final-volume-episode-row ${selectedEpisodeId === episode.id ? "is-selected" : ""} ${isBouncing(episode.id) ? "story-list-card-bounce" : ""}`} role="button" tabIndex={0} onClick={() => triggerEpisode(episode.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); triggerEpisode(episode.id); } }}>
                                <span className="final-volume-episode-number">{String(episode.number).padStart(2, "0")}</span>
                                <img className="final-volume-episode-file" src={MAIN_STORY_RESOURCES.storyFileIcon()} alt="" draggable="false" />
                                <span className="final-volume-episode-title">{episode.title}</span>
                                <button className="final-volume-episode-enter" type="button" onClick={(event) => handleEpisodeEnter(event, episode)}><img src={MAIN_STORY_RESOURCES.finalChapterButton()} alt="" draggable="false" /><span>进入</span></button>
                            </div>
                        </div>
                    ))}
                </div> : <div className="final-volume-episode-empty">该章节的剧情条目暂未录入</div>}
            </div>
        </section>
    );
}
