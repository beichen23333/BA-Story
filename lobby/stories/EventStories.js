import { getResourcesUrl } from "../../public/utils.ts";
import { EVENT_STORY_TEXTS, EVENT_STORY_EPISODES } from "../../public/texts/eventtexts.js";

export const EVENT_STORY_PAGES = [
    [
        ["801", 1],
        ["802", 2],
        ["803", 3]
    ]
].map((page, pageIndex) => ({
    id: `event-page-${pageIndex + 1}`,
    stories: page.map(([id, volume]) => ({
        id,
        volume,
        image: getResourcesUrl("eventContent", `Event_${id}.png`)
    }))
}));

export const EVENT_STORY_PAGES_BY_PAGE = EVENT_STORY_PAGES;

export function getEventStoryPage(pageIndex, language = "cn") {
    const page = EVENT_STORY_PAGES[pageIndex] || EVENT_STORY_PAGES[0];
    return page.stories.map((story) => {
        const localized = EVENT_STORY_TEXTS[story.id] || EVENT_STORY_TEXTS["801"];
        const text = localized[language] || localized.cn;
        const episodeEntries = EVENT_STORY_EPISODES[story.id];
        const episodes = episodeEntries ? episodeEntries.map((episode) => ({
            id: episode.id,
            number: episode.number,
            key: episode.key,
            descriptionKey: episode.descriptionKey,
            GroupId: episode.GroupId,
            title: episode.title[language] || episode.title.cn,
            description: episode.description[language] || episode.description.cn
        })) : undefined;
        return {
            ...story,
            ...(episodes ? { episodes } : {}),
            title: text[0],
            description: text[1]
        };
    });
}
