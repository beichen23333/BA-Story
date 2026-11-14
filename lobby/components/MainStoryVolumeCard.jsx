import React, { useId } from "react";
import { MAIN_STORY_RESOURCES } from "../../shared/utils.ts";
const OUTLINE_PATH = "M203 3 L995 3 L797 347 L5 347 Z";

export function MainStoryVolumeCard({ volume, index = 0, selected = false, onSelect, staticCard = false, centered = false, descriptionBelow = false }) {
    const position = index % 2 === 0 ? "lower" : "upper";
    const outlineId = `main-story-volume-outline-${useId().replace(/:/g, "")}`;
    const gradientId = `${outlineId}-gradient`;
    const cornerGradientId = `${outlineId}-corner-gradient`;
    const cardClassName = `main-story-volume-card ${selected ? "is-selected" : ""} ${position} ${staticCard ? "is-static" : ""} ${centered ? "is-centered" : ""}`;
    return (
        <button
            type="button"
            className={cardClassName}
            style={{ left: centered ? "50%" : `${6.5 + Math.floor(index / 2) * 45 + (index % 2) * 27}cqw`, width: "var(--main-story-volume-card-width)", minWidth: "var(--main-story-volume-card-width)", maxWidth: "var(--main-story-volume-card-width)", boxSizing: "border-box" }}
            onClick={staticCard ? undefined : () => onSelect?.(volume)}
            disabled={staticCard}
            aria-pressed={staticCard ? undefined : selected}
            aria-label={volume.title}
        >
            <div className="main-story-volume-art">
                {volume.backgroundImageUrl && <img className="main-story-volume-background" src={volume.backgroundImageUrl} alt="" loading="lazy" decoding="async" draggable="false" />}
                <img className="main-story-volume-image" src={volume.imageUrl} alt="" loading="lazy" decoding="async" draggable="false" />
                {selected && <>
                    <div className="main-story-volume-description">
                        <p>{volume.description}</p>
                    </div>
                    <img className="main-story-volume-deco" src={MAIN_STORY_RESOURCES.volumeDecoration()} alt="" loading="lazy" decoding="async" draggable="false" />
                </>}
            </div>
            {selected && <svg className="main-story-volume-outline" viewBox="0 0 1000 350" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <path id={outlineId} d={OUTLINE_PATH} />
                    <radialGradient id={gradientId}>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="42%" stopColor="#fffef0" />
                        <stop offset="100%" stopColor="#f5d98b" />
                    </radialGradient>
                    <radialGradient id={cornerGradientId}>
                        <stop offset="0%" stopColor="#fffef5" stopOpacity=".98" />
                        <stop offset="24%" stopColor="#fff0bb" stopOpacity=".86" />
                        <stop offset="58%" stopColor="#ffdc8b" stopOpacity=".38" />
                        <stop offset="100%" stopColor="#ffdc8b" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <path d={OUTLINE_PATH} className="main-story-volume-outline-glow" />
                <path d={OUTLINE_PATH} className="main-story-volume-outline-aura" />
                <path d={OUTLINE_PATH} className="main-story-volume-outline-line" />
                <circle cx="203" cy="3" r="19" fill={`url(#${cornerGradientId})`} className="main-story-volume-outline-corner" />
                <circle cx="995" cy="3" r="19" fill={`url(#${cornerGradientId})`} className="main-story-volume-outline-corner" />
                <circle cx="797" cy="347" r="19" fill={`url(#${cornerGradientId})`} className="main-story-volume-outline-corner" />
                <circle cx="5" cy="347" r="19" fill={`url(#${cornerGradientId})`} className="main-story-volume-outline-corner" />
                <circle r="7" fill={`url(#${gradientId})`} className="main-story-volume-outline-dot">
                    <animateMotion dur="7s" repeatCount="indefinite" path={OUTLINE_PATH} />
                </circle>
            </svg>}
            <div className="main-story-volume-caption">
                <span className="main-story-volume-title">{volume.displayTitle}</span>
                <span className="main-story-volume-mark" aria-hidden="true">○＋×△</span>
            </div>
            {descriptionBelow && <div className="main-story-volume-description-below" style={{ "--main-story-volume-description-scale": Math.max(0.82, Math.min(1, 46 / Math.max(Array.from(volume.description || "").length, 46))) }}><p>{volume.description}</p></div>}
        </button>
    );
}
