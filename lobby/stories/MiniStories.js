import { asset } from "../../public/utils.ts";
import { MINI_STORY_TEXTS, MINI_STORY_EPISODES } from "../../public/texts/minitexts.js";

export const MINI_STORY_PAGES = [
    [
        ["red-winter-tour", 1],
        ["thermae-akai", 2],
        ["kirara-erika", 3],
        ["highlander-log", 4],
        ["ownerless-gift", 5],
        ["february-19-record", 6]
    ],
    [
        ["gourmet-cookie-rescue", 7],
        ["unexpected-encounter", 8],
        ["mangyangz-night", 9],
        ["dormitory-wardens-run", 10],
        ["end-of-manual-era", 11],
        ["misuzu-melancholy", 12]
    ],
    [
        ["on-air-gehenna", 13],
        ["weeds-not-alone", 14],
        ["wandering-pharmacist", 15],
        ["ibuki-runaway", 16],
        ["road-to-ryugu", 17]
    ]
].map(
    (page, pageIndex) => ({
        id: `mini-page-${pageIndex + 1}`, stories: page.map(([id, volume]) => ({
            id,
            volume,
            image: asset(`mode/Mini_Volume_${volume}.png`)
        }))
    })
);
export function getMiniStoryPage(pageIndex, language = "cn") {
    const page = MINI_STORY_PAGES[pageIndex] || MINI_STORY_PAGES[0];
    return page.stories.map(
        (story) => {
            const localized = MINI_STORY_TEXTS[story.id] || MINI_STORY_TEXTS["red-winter-tour"];
            const text = localized[language] || localized.cn;
            const episodeEntries = MINI_STORY_EPISODES[story.id];
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
        }
    );
}
