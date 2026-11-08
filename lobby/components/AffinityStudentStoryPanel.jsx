import React from "react";
import { getCostumeCollectionTextureUrl, getCostumeDisplayName } from "../stories/AffinityStories.ts";
import { AFFINITY_STUDENT_STORY_EPISODES } from "../../shared/texts/affinitytexts.js";
import { StudentSpinePreview } from "./StudentSpinePreview";
import "../styles/affinity-student-story.css";

export function AffinityStudentStoryPanel({ student, language = "cn", t, onEpisodeSelect }) {
    if (!student) return null;
    const displayName = getCostumeDisplayName(student, language);
    const spineResourceName = student.ScenarioCharacter || student.SpineResourceName || "";
    const portraitUrl = getCostumeCollectionTextureUrl(student.CollectionTexturePath);
    const episodes = (AFFINITY_STUDENT_STORY_EPISODES[String(student.CostumeGroupId)] || []).map((episode) => ({
        ...episode,
        title: episode.title?.[language] || episode.title?.cn || "",
        description: episode.description?.[language] || episode.description?.cn || "",
    }));
    const story = { id: String(student.CostumeGroupId), title: displayName };
    return <section className="affinity-student-story-layout" aria-label={displayName}>
        <section className="affinity-student-visual" aria-label={displayName}>
            <StudentSpinePreview resourceName={spineResourceName} label={displayName} t={t} />
            <div className="affinity-student-info">
                {portraitUrl && <img className="affinity-student-avatar" src={portraitUrl} alt={displayName} draggable="false" />}
                <div className="affinity-student-info-copy">
                    <div className="affinity-student-school">{student.School || ""}</div>
                    <div className="affinity-student-name">{displayName}</div>
                </div>
            </div>
        </section>
        <section className="affinity-student-episodes" aria-label={t.affinityStudentEpisodesTitle}>
            <h2 className="story-detail-episodes-heading affinity-student-episodes-heading">{t.affinityStudentEpisodesTitle}</h2>
            <div className="affinity-student-episode-list">
                {episodes.map((episode) => <article className="affinity-student-episode" key={episode.id}>
                    <div className="affinity-student-episode-number">{String(episode.number ?? episode.id).padStart(2, "0")}</div>
                    <div className="affinity-student-episode-copy">
                        <div className="affinity-student-episode-title" title={episode.title}>{episode.title}</div>
                    </div>
                    <button className="affinity-student-episode-enter" type="button" onClick={() => onEpisodeSelect?.(story, episode)} disabled={!Number.isInteger(Number(episode.GroupId)) || Number(episode.GroupId) <= 0} aria-label={`${t.enterEpisode}: ${episode.title}`}>
                        <img src="./assets/CCG_Img_BtnBlue.png" alt="" draggable="false" />
                        <span>{t.enterEpisode}</span>
                    </button>
                </article>)}
            </div>
        </section>
    </section>;
}
