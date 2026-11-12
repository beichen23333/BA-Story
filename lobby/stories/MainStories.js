import { getResourcesUrl } from "../../shared/utils.ts";
import { MAIN_STORY_CHAPTER_DESCRIPTION_TEXTS, MAIN_STORY_CHAPTER_TEXTS, MAIN_STORY_CHAPTER_TITLE_TEXTS, MAIN_STORY_VOLUME_DESCRIPTION_TEXTS, MAIN_STORY_VOLUME_TITLE_TEXTS } from "../../shared/texts/maintexts.js";

export const MAIN_STORY_VOLUME_CONFIG = [
    { id: "prologue", number: 0, titleKey: 4054753253, descriptionKey: 1557014655, image: "Prologue_Volume_1.png" },
    { id: "main-1", number: 1, titleKey: 919870100, descriptionKey: 3763745176, image: "Main_Volume_1.png" },
    { id: "main-2", number: 2, titleKey: 610967279, descriptionKey: 2110876064, image: "Main_Volume_2.png" },
    { id: "main-3", number: 3, titleKey: 2810575850, descriptionKey: 2791927741, image: "Main_Volume_3.png" },
    { id: "main-4", number: 4, titleKey: 4245034097, descriptionKey: 4105693142, image: "Main_Volume_4.png" },
    { id: "main-5", number: 5, titleKey: 960680238, descriptionKey: 2827572587, image: "Main_Volume_5.png" },
    { id: "main-6", number: 6, titleKey: 782244883, descriptionKey: 1970484281, image: "Main_Volume_6.png" },
    { id: "special-operation", number: 7, titleKey: 2255131754, descriptionKey: 3930897789, image: "SpecialOperation_Volume_1.png" }
];

export const MAIN_STORY_SERIES2_VOLUME_CONFIG = [
    { id: "series2-prologue", number: 0, titleKey: 1261830304, image: "Prologue_Volume_Series2_1.png" },
    { id: "series2-0", number: 0, titleKey: 1685330631, image: "Main_Volume_Series2_1.png" },
    { id: "series2-1", number: 1, titleKey: 2210067228, image: "Main_Volume_Series2_2.png" },
    { id: "series2-2", number: 2, titleKey: 1231709678, image: "Main_Volume_Series2_3.png" },
    { id: "series2-special-operation", number: 3, titleKey: 3774576463, image: "SpecialOperation_Volume_Series2_1.png" }
];

function getTextByKey(records, key, language) {
    if (key == null) return "";
    const record = records.find((item) => item.Key === key || item.Id === key);
    if (!record) return "";
    if (language === "kr") return record.Kr;
    if (language === "cn" || language === "jp") return record.Jp;
    return "";
}

function getChapterTitleDisplay(title) {
    return title.replace(/^第[一二三四五六七八九十\d]+章\s*/, "");
}

export function getMainStoryVolumes(language = "cn", series = 1) {
    const volumeConfig = Number(series) === 2 ? MAIN_STORY_SERIES2_VOLUME_CONFIG : MAIN_STORY_VOLUME_CONFIG;
    return volumeConfig.map((volume) => {
        const title = getTextByKey(MAIN_STORY_VOLUME_TITLE_TEXTS, volume.titleKey, language);
        const chapters = MAIN_STORY_CHAPTER_TEXTS.filter((chapter) => chapter.volumeId === volume.id).map((chapter) => {
            const chapterTitle = getTextByKey(MAIN_STORY_CHAPTER_TITLE_TEXTS, chapter.titleKey, language);
            return {
                ...chapter,
                title: chapterTitle,
                displayTitle: getChapterTitleDisplay(chapterTitle),
                description: getTextByKey(MAIN_STORY_CHAPTER_DESCRIPTION_TEXTS, chapter.descriptionKey, language)
            };
        });
        const volumeDescription = getTextByKey(MAIN_STORY_VOLUME_DESCRIPTION_TEXTS, volume.descriptionKey, language);
        return {
            ...volume,
            title,
            displayTitle: title,
            description: volumeDescription || chapters[0]?.description || "",
            imageUrl: getResourcesUrl("scenarioMode", volume.image),
            chapters
        };
    });
}
