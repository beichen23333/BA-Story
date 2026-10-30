import { getResourcesUrl } from "../../public/utils.ts";
import { WORK_STORY_TEXTS, WORK_STORY_EPISODES } from "../../public/texts/worktexts.js";

export const WORK_STORY_PAGES = [
    [
        ["WeekDungeon", 1],
        ["Chaser", 2],
        ["Craft", 3],
        ["EliminateRaid", 4],
        ["Arena", 5],
        ["Shop", 6]
    ],
    [
        ["TimeAttack", 7],
        ["Mission", 8],
        ["MiniEvent", 9],
        ["Raid", 10],
        ["MultiFloorRaid", 11]
    ]
].map((page, pageIndex) => ({
    id: `work-page-${pageIndex + 1}`,
    stories: page.map(([id, volume]) => ({
        id,
        volume,
        image: getResourcesUrl("scenarioMode", `Replay_Contents_${id}.png`)
    }))
}));

export const WORK_STORY_PAGES_BY_PAGE = WORK_STORY_PAGES;

export function getWorkStoryPage(pageIndex, language = "cn") {
    const page = WORK_STORY_PAGES[pageIndex] || WORK_STORY_PAGES[0];
    return page.stories.map((story) => {
        const localized = WORK_STORY_TEXTS[story.id] || WORK_STORY_TEXTS.WeekDungeon;
        const text = localized[language] || localized.cn;
        const episodeEntries = WORK_STORY_EPISODES[story.id];
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
