import React from "react";
import { ChevronDown } from "lucide-react";
import { MAIN_STORY_UI_TEXTS } from "../../shared/texts/maintexts.js";
import { MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";

export function MainStoryChapterPanel({ volume, language, selectedChapterId, onChapterSelect, onClickSound, onFinalChapterClick, showFinalChapter = true, showChapterDescription = false, className = "" }) {
    const ui = MAIN_STORY_UI_TEXTS;
    const localeKey = language === "kr" ? "Kr" : language === "cn" || language === "jp" ? "Jp" : null;
    const heading = volume.title;
    const selectedChapter = volume.chapters.find((chapter) => chapter.id === selectedChapterId) || volume.chapters[0];
    const { trigger, isBouncing } = useStoryCardTouch(onChapterSelect, onClickSound);
    const { trigger: triggerFinalChapter, isBouncing: isFinalChapterBouncing } = useStoryCardTouch(onFinalChapterClick, onClickSound);

    return (
        <>
            <img className={`main-story-chapter-background ${className}`} src={volume.chapterBackgroundUrl || MAIN_STORY_RESOURCES.chapterBackground()} alt="" loading="lazy" decoding="async" draggable="false" />
            <aside className={`main-story-chapter-panel ${className}`} aria-label={heading}>
                <div className="main-story-chapter-heading">
                    <ChevronDown size={16} strokeWidth={3} />
                    <span>{heading}</span>
                </div>
                <div className="main-story-chapter-list">
                    {volume.chapters.map((chapter, index) => (
                        <div
                            className="main-story-chapter-row-container"
                            key={chapter.id}
                            style={{ marginLeft: index === 0 ? 0 : `calc(0px - ${Array(index).fill("var(--main-story-chapter-stagger)").join(" - ")})` }}
                        >
                            <button
                                type="button"
                                className={`main-story-chapter-row ${isBouncing(chapter) ? "story-list-card-bounce" : ""}`}
                                onClick={() => trigger(chapter)}
                                aria-pressed={selectedChapterId === chapter.id}
                            >
                                <span className="main-story-chapter-number">{chapter.number}{localeKey ? ui.chapterSuffix[localeKey] : ""}</span>
                                <span className="main-story-chapter-title">{chapter.displayTitle}</span>
                            </button>
                        </div>
                    ))}
                </div>
                {showChapterDescription && <div className="main-story-final-chapter-description">{selectedChapter?.description || ""}</div>}
            </aside>
            {showFinalChapter && <button className={`main-story-final-chapter ${isFinalChapterBouncing(volume) ? "story-list-card-bounce" : ""}`} type="button" onClick={() => triggerFinalChapter(volume)} aria-label={ui.finalChapter[localeKey] || "Final"}>
                <img src={MAIN_STORY_RESOURCES.finalChapterButton()} alt="" loading="lazy" decoding="async" draggable="false" />
                <span className="main-story-final-chapter-title">{localeKey ? ui.finalChapter[localeKey] : "Final"}</span>
            </button>}
        </>
    );
}
