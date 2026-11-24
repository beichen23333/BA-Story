import React from "react";
import { FINAL_VOLUME_CHAPTER_TEXTS } from "../../shared/texts/finalvoltexts.js";
import { getPublicAssetUrl, MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
import { useStoryCardTouch } from "../hooks/useStoryCardTouch.js";

const FILE_ICON_URL = getPublicAssetUrl("file.png");

export function FinalVolumeChapterSelectPanel({ language = "cn", selectedChapterId, onChapterSelect, onChapterEnter, onClickSound, episodeClearText = "" }) {
    const localeKey = language === "kr" ? "Kr" : "Jp";
    const selectedChapter = FINAL_VOLUME_CHAPTER_TEXTS.find((chapter) => chapter.id === selectedChapterId) || FINAL_VOLUME_CHAPTER_TEXTS[0];
    const { trigger, isBouncing } = useStoryCardTouch((chapter) => onChapterSelect?.(chapter.id), onClickSound);
    const orderedChapters = [...FINAL_VOLUME_CHAPTER_TEXTS].reverse();
    return <section className="main-story-final-chapter-select" aria-label="Final volume chapters">
        <div className="main-story-final-chapter-art-wrap">
            <img key={selectedChapter.id} className="main-story-final-chapter-art" src={MAIN_STORY_RESOURCES.finalChapterImage(selectedChapter.image)} alt="" loading="lazy" decoding="async" draggable="false" />
            <div className="main-story-final-chapter-art-shade" aria-hidden="true" />
        </div>
        <div className="main-story-final-chapter-copy" aria-live="polite">
            <div className="main-story-final-chapter-title-line">
                <span className="main-story-final-chapter-number">第{selectedChapter.number}章</span>
                <span className="main-story-final-chapter-divider" aria-hidden="true" />
                <span className="main-story-final-chapter-title">{selectedChapter.title[localeKey]}</span>
            </div>
            <p className="main-story-final-chapter-description">{selectedChapter.description[localeKey]}</p>
        </div>
        <div className="main-story-final-chapter-status"><span>{episodeClearText}</span></div>
        <div className="main-story-final-chapter-list">
            {orderedChapters.map((chapter, index) => <div className={`main-story-final-chapter-row-container ${selectedChapter.id === chapter.id ? "is-selected" : ""} ${isBouncing(chapter) ? "story-list-card-bounce" : ""}`} key={chapter.id} style={{ marginLeft: index === 0 ? 0 : `calc(0px - ${Array(index).fill("var(--main-story-chapter-stagger)").join(" - ")})` }}>
                <div className="main-story-final-chapter-row">
                    <button type="button" className="main-story-final-chapter-row-select" onClick={() => trigger(chapter)} aria-pressed={selectedChapter.id === chapter.id} aria-label={`第${chapter.number}章 ${chapter.title[localeKey]}`}>
                        <span className="main-story-final-chapter-row-number">{String(chapter.number).padStart(2, "0")}</span>
                        <img className="main-story-final-chapter-file-icon" src={FILE_ICON_URL} alt="" draggable="false" />
                        <span className="main-story-final-chapter-row-title">{chapter.title[localeKey]}</span>
                    </button>
                    <button type="button" className="main-story-final-chapter-enter" onClick={() => onChapterEnter?.(chapter)} aria-label={`进入第${chapter.number}章`}>
                        <img src={MAIN_STORY_RESOURCES.finalChapterButton()} alt="" loading="lazy" decoding="async" draggable="false" />
                        <span>进入</span>
                    </button>
                </div>
            </div>)}
        </div>
    </section>;
}
