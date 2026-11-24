import { FINAL_VOLUME_CHAPTER_DESCRIPTION_TEXTS, FINAL_VOLUME_CHAPTER_TITLE_TEXTS } from "../../shared/texts/finalvoltexts.js";
import { FINAL_VOLUME_CHAPTER_1_EPISODE_DESCRIPTION_TEXTS, FINAL_VOLUME_CHAPTER_1_EPISODE_TITLE_TEXTS } from "../../shared/texts/finalvolumechapter1texts.js";

const FINAL_VOLUME_CHAPTER_IMAGES = [
    "Main_Chapter_100_1.png",
    "Main_Chapter_100_2.png",
    "Main_Chapter_100_3.png",
    "Main_Chapter_100_4.png"
];

export function getFinalVolumeChapters(language = "cn") {
    return FINAL_VOLUME_CHAPTER_TITLE_TEXTS.map((record, index) => {
        const descriptionRecord = FINAL_VOLUME_CHAPTER_DESCRIPTION_TEXTS[index];
        const imageFile = FINAL_VOLUME_CHAPTER_IMAGES[index];
        const title = language === "kr" ? record.Kr : record.Jp;
        return {
            id: `final-chapter-${index + 1}`,
            number: index + 1,
            title,
            displayTitle: title,
            titleKey: record.Key,
            description: language === "kr" ? descriptionRecord?.Kr || "" : descriptionRecord?.Jp || "",
            descriptionKey: descriptionRecord?.Key,
            imageFile
        };
    });
}

export function getFinalVolumeChapter1Episodes(language = "cn") {
    return FINAL_VOLUME_CHAPTER_1_EPISODE_TITLE_TEXTS.map((record, index) => {
        const descriptionRecord = FINAL_VOLUME_CHAPTER_1_EPISODE_DESCRIPTION_TEXTS[index];
        return {
            id: `final-chapter-1-episode-${index + 1}`,
            number: index + 1,
            key: record.Key,
            title: language === "kr" ? record.Kr : record.Jp,
            description: language === "kr" ? descriptionRecord?.Kr || "" : descriptionRecord?.Jp || ""
        };
    }).reverse();
}

export { FINAL_VOLUME_CHAPTER_IMAGES };
