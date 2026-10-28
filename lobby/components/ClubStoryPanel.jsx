import React from "react";
import { getClubStoryPage } from "../components/ClubStories";
import { ClubStoryCard } from "./ClubStoryCard";
import { TEXT } from "../../public/texts.js";
import "../styles/club-story.css";

export function ClubStoryPanel({ pageIndex = 0, language = "cn", flipPhase = "", flipDirection = "next", onStorySelect, onCardClickSound }) {
    const t = TEXT[language];
    const stories = getClubStoryPage(pageIndex, language);
    const classes = ["club-story-panel", flipPhase === "blank" ? "is-page-blank" : "", flipPhase === "turning" ? "is-page-flipping" : "", flipPhase === "revealing" ? "is-page-revealing" : "", flipDirection === "previous" ? "flip-previous" : ""].filter(Boolean).join(" ");
    return <section className={classes} aria-label={t.clubTitle}>
        {stories.map((story, index) => <ClubStoryCard key={story.id} story={story} index={index} onSelect={onStorySelect} onClickSound={onCardClickSound} />)}
    </section>;
}
