import React from "react";
import { getClubStoryPage } from "../stories/ClubStories.js";
import { getMiniStoryPage } from "../stories/MiniStories.js";
import { getWorkStoryPage } from "../stories/WorkStories.js";
import { StoryCategoryCard } from "./StoryCategoryCard";
import { TEXT } from "../../public/texts.js";
import "../styles/story-list.css";

export function StoryListPanel({ pageIndex = 0, language = "cn", flipPhase = "", flipDirection = "next", onStorySelect, onCardClickSound, storyType = "club" }) {
    const t = TEXT[language];
    const pageLoaders = { club: getClubStoryPage, mini: getMiniStoryPage, work: getWorkStoryPage };
    const stories = (pageLoaders[storyType] || getClubStoryPage)(pageIndex, language);
    const classes = ["story-list-panel", flipPhase === "blank" ? "is-page-blank" : "", flipPhase === "turning" ? "is-page-flipping" : "", flipPhase === "revealing" ? "is-page-revealing" : "", flipDirection === "previous" ? "flip-previous" : ""].filter(Boolean).join(" ");
    return <section className={classes} aria-label={storyType === "work" ? t.archiveTitle : storyType === "mini" ? t.affinity : t.clubTitle}>
        {stories.map((story, index) => <StoryCategoryCard key={story.id} story={story} index={index} onSelect={onStorySelect} onClickSound={onCardClickSound} />)}
    </section>;
}
