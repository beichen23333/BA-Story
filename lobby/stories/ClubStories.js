import { getResourcesUrl } from "../../public/utils.ts";
import { CLUB_STORY_TEXTS, CLUB_STORY_EPISODES } from "../../public/texts/clubtexts.js";

export const CLUB_STORY_PAGES = [
    [
        ["gourmet", 1],
        ["cleaning", 2],
        ["problem-solver", 3],
        ["engineer", 4],
        ["veritas", 5],
        ["nutrition", 6]
    ],
    [
        ["rescue-knights", 7],
        ["justice-committee", 8],
        ["disciplinary-committee", 9],
        ["after-school-sweets", 10],
        ["countermeasures", 11],
        ["red-winter", 12]
    ],
    [
        ["festival-management", 13],
        ["training-club", 14],
        ["game-development", 15],
        ["plum-garden", 16],
        ["public-safety-bureau", 17],
        ["special-class", 18]
    ],
    [
        ["ninja-research", 19],
        ["rabbit-squad", 20],
        ["seminar", 21],
        ["yin-yang-club", 22],
        ["training-club-official", 23],
        ["genryumon", 24]
    ],
    [
        ["hot-springs-development", 25],
        ["tea-party", 26],
        ["occult-research", 27]
    ]
].map(
    (page, pageIndex) => ({
        id: `club-page-${pageIndex + 1}`, stories: page.map(([id, volume]) => ({
            id,
            volume,
            image: getResourcesUrl("scenarioMode", `Sub_Volume_${volume}.png`)
        }))
    })
);
export function getClubStoryPage(pageIndex, language = "cn") {
    const page = CLUB_STORY_PAGES[pageIndex] || CLUB_STORY_PAGES[0];
    return page.stories.map(
        (story) => {
            const localized = CLUB_STORY_TEXTS[story.id] || CLUB_STORY_TEXTS.gourmet;
            const text = localized[language] || localized.cn;
            const episodeEntries = CLUB_STORY_EPISODES[story.id];
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