import { getResourcesUrl } from "../../public/utils.ts";
import { EVENT_STORY_TEXTS, EVENT_STORY_EPISODES } from "../../public/texts/eventtexts.js";

export const EVENT_STORY_PAGES = [
    [
        ["801", 1],
        ["802", 2],
        ["803", 3],
        ["804", 4],
        ["805", 5],
        ["806", 6]
    ],
    [
        ["807", 7],
        ["808", 8],
        ["809", 9],
        ["810", 10],
        ["811", 11],
        ["812", 12]
    ],
    [
        ["813", 13],
        ["814", 14],
        ["815", 15],
        ["816", 16],
        ["817", 17],
        ["818", 18]
    ],
    [
        ["819", 19],
        ["820", 20],
        ["821", 21],
        ["822", 22],
        ["823", 23],
        ["824", 24]
    ],
    [
        ["825", 25],
        ["826", 26],
        ["827", 27],
        ["828", 28],
        ["829", 29],
        ["830", 30]
    ],
    [
        ["831", 31],
        ["832", 32],
        ["833", 33],
        ["834", 34],
        ["835", 35],
        ["836", 36]
    ],
    [
        ["837", 37],
        ["838", 38],
        ["839", 39],
        ["840", 40],
        ["841", 41],
        ["842", 42]
    ],
    [
        ["843", 43],
        ["844", 44],
        ["845", 45],
        ["846", 46],
        ["847", 47],
        ["848", 48]
    ],
    [
        ["849", 49],
        ["850", 50],
        ["851", 51],
        ["852", 52],
        ["853", 53],
        ["854", 54]
    ],
    [
        ["856", 55],
        ["859", 56],
        ["860", 57],
        ["861", 58],
        ["862", 59],
        ["864", 60]
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
