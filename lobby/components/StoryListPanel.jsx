import React from "react";
import { getClubStoryPage } from "../stories/ClubStories.js";
import { getMiniStoryPage } from "../stories/MiniStories.js";
import { getWorkStoryPage } from "../stories/WorkStories.js";
import { getEventStoryPage } from "../stories/EventStories.js";
import { StoryCategoryCard } from "./StoryCategoryCard";
import { EventStoryCategoryCard } from "./EventStoryCategoryCard";
import { TEXT } from "../../shared/texts.js";
import "../styles/story-list.css";

export function StoryListPanel({ pageIndex = 0, language = "cn", flipPhase = "", flipDirection = "next", onStorySelect, onCardClickSound, storyType = "club", userName = "sensei" }) {
    const t = TEXT[language];
    const pageLoaders = { club: getClubStoryPage, mini: getMiniStoryPage, work: getWorkStoryPage, event: getEventStoryPage };
    const stories = (pageLoaders[storyType] || getClubStoryPage)(pageIndex, language);
    const classes = ["story-list-panel", flipPhase === "blank" ? "is-page-blank" : "", flipPhase === "turning" ? "is-page-flipping" : "", flipPhase === "revealing" ? "is-page-revealing" : "", flipDirection === "previous" ? "flip-previous" : ""].filter(Boolean).join(" ");
    return <section className={classes} aria-label={storyType === "work" || storyType === "event" ? t.archiveTitle : storyType === "mini" ? t.affinity : t.clubTitle}>
        {stories.map((story, index) => storyType === "event" ? <EventStoryCategoryCard key={story.id} story={story} index={index} onSelect={onStorySelect} onClickSound={onCardClickSound} userName={userName} /> : <StoryCategoryCard key={story.id} story={story} index={index} onSelect={onStorySelect} onClickSound={onCardClickSound} userName={userName} storyType={storyType} />)}
    </section>;
}
