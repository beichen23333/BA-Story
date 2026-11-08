import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, ListFilter, Search } from "lucide-react";
import { compareCostumeByInitial, getCostumeCollectionTextureUrl, getCostumeDisplayName, loadCostumeExcel } from "../stories/AffinityStories.ts";
import "../styles/affinity-stories.css";

const COSTUME_PAGE_SIZE = 24;

export function AffinityStoryPanel({ t, language = "cn", pageIndex = 0, flipPhase = "", flipDirection = "next", onPageCountChange, onPageReset, onStudentSelect, onStudentClickSound }) {
    const [costumes, setCostumes] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const mountedRef = useRef(false);
    const sortMenuRef = useRef(null);
    const cardClickLock = useRef(false);
    const cardClickTimer = useRef(null);
    const [bouncingStudentId, setBouncingStudentId] = useState(null);
    useEffect(() => () => { if (cardClickTimer.current) window.clearTimeout(cardClickTimer.current); }, []);
    useEffect(() => {
        let active = true;
        mountedRef.current = true;
        setLoading(true);
        setLoadError(false);
        loadCostumeExcel().then((data) => {
            if (active) setCostumes(data);
        }).catch(() => {
            if (active) setLoadError(true);
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; mountedRef.current = false; };
    }, []);
    const visibleCostumes = useMemo(() => {
        const query = searchValue.trim().toLocaleLowerCase("en-US");
        const filtered = costumes.filter((costume) => getCostumeDisplayName(costume, language).toLocaleLowerCase().includes(query) || costume.DevName.toLocaleLowerCase("en-US").includes(query));
        return filtered.sort((left, right) => {
            const result = sortBy === "id" ? left.CostumeGroupId - right.CostumeGroupId : compareCostumeByInitial(left, right, language);
            return sortDirection === "asc" ? result : -result;
        });
    }, [costumes, searchValue, sortBy, sortDirection, language]);
    const pageCount = Math.max(1, Math.ceil(visibleCostumes.length / COSTUME_PAGE_SIZE));
    const pageCostumes = visibleCostumes.slice(pageIndex * COSTUME_PAGE_SIZE, (pageIndex + 1) * COSTUME_PAGE_SIZE);
    useEffect(() => { onPageCountChange?.(pageCount); }, [pageCount, onPageCountChange]);
    useEffect(() => {
        if (!sortMenuOpen) return undefined;
        const handlePointerDown = (event) => { if (!sortMenuRef.current?.contains(event.target)) setSortMenuOpen(false); };
        const handleKeyDown = (event) => { if (event.key === "Escape") setSortMenuOpen(false); };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => { document.removeEventListener("pointerdown", handlePointerDown); document.removeEventListener("keydown", handleKeyDown); };
    }, [sortMenuOpen]);
    useEffect(() => { if (flipPhase) setSortMenuOpen(false); }, [flipPhase]);
    const resetToFirstPage = () => onPageReset?.();
    const handleSearchChange = (event) => { setSearchValue(event.target.value); resetToFirstPage(); };
    const handleSortByChange = (nextSortBy) => { setSortBy(nextSortBy); setSortMenuOpen(false); resetToFirstPage(); };
    const handleSortDirectionChange = () => { setSortDirection((value) => value === "asc" ? "desc" : "asc"); resetToFirstPage(); };
    const handleStudentClick = (costume) => {
        if (cardClickLock.current || flipPhase) return;
        cardClickLock.current = true;
        setBouncingStudentId(costume.CostumeGroupId);
        onStudentClickSound?.();
        cardClickTimer.current = window.setTimeout(() => {
            cardClickTimer.current = null;
            setBouncingStudentId(null);
            cardClickLock.current = false;
            onStudentSelect?.(costume);
        }, 440);
    };
    const handleStudentKeyDown = (event, costume) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleStudentClick(costume); }
    };
    const retryLoad = () => {
        setLoading(true);
        setLoadError(false);
        loadCostumeExcel(true).then((data) => {
            if (mountedRef.current) setCostumes(data);
        }).catch(() => {
            if (mountedRef.current) setLoadError(true);
        }).finally(() => {
            if (mountedRef.current) setLoading(false);
        });
    };
    const panelClasses = ["story-list-panel", "affinity-story-list-panel", flipPhase === "blank" ? "is-page-blank" : "", flipPhase === "turning" ? "is-page-flipping" : "", flipPhase === "revealing" ? "is-page-revealing" : "", flipDirection === "previous" ? "flip-previous" : ""].filter(Boolean).join(" ");
    return <section className="affinity-story-page" aria-label={t.archiveFavorTitle}>
        <div className={`affinity-story-toolbar ${flipPhase ? "is-flipping" : ""}`}>
            <label className="affinity-story-search">
                <Search aria-hidden="true" size={25} strokeWidth={2.5} />
                <input type="search" value={searchValue} onChange={handleSearchChange} placeholder={t.affinitySearchPlaceholder} aria-label={t.affinitySearchPlaceholder} disabled={Boolean(flipPhase)} />
            </label>
            <div className="affinity-story-sort-wrap" ref={sortMenuRef}>
                <button className="affinity-story-sort" type="button" aria-label={t.affinitySortLabel} aria-haspopup="true" aria-expanded={sortMenuOpen} aria-controls="affinity-story-sort-menu" onClick={() => setSortMenuOpen((value) => !value)} disabled={Boolean(flipPhase)}>
                    <ListFilter aria-hidden="true" size={24} strokeWidth={2.5} />
                    <span className="affinity-story-sort-name">{sortBy === "id" ? t.affinitySortById : t.affinitySortByName}</span>
                    <ChevronDown className={`affinity-story-sort-chevron ${sortMenuOpen ? "is-open" : ""}`} aria-hidden="true" size={20} strokeWidth={2.5} />
                </button>
                {sortMenuOpen && <div className="affinity-story-sort-menu" id="affinity-story-sort-menu" role="group" aria-label={t.affinitySortOptionsLabel}>
                    <button className={`affinity-story-sort-option ${sortBy === "name" ? "is-selected" : ""}`} type="button" onClick={() => handleSortByChange("name")} aria-pressed={sortBy === "name"}>
                        <span>{t.affinitySortByName}</span>{sortBy === "name" && <Check aria-hidden="true" size={18} />}
                    </button>
                    <button className={`affinity-story-sort-option ${sortBy === "id" ? "is-selected" : ""}`} type="button" onClick={() => handleSortByChange("id")} aria-pressed={sortBy === "id"}>
                        <span>{t.affinitySortById}</span>{sortBy === "id" && <Check aria-hidden="true" size={18} />}
                    </button>
                </div>}
            </div>
            <button className="affinity-story-sort-direction" type="button" onClick={handleSortDirectionChange} aria-label={sortDirection === "asc" ? (sortBy === "id" ? t.affinitySortIdDescending : t.affinitySortNameDescending) : (sortBy === "id" ? t.affinitySortIdAscending : t.affinitySortNameAscending)} title={sortDirection === "asc" ? (sortBy === "id" ? t.affinitySortIdDescending : t.affinitySortNameDescending) : (sortBy === "id" ? t.affinitySortIdAscending : t.affinitySortNameAscending)} disabled={Boolean(flipPhase)}>
                {sortDirection === "asc" ? <ArrowUp size={25} strokeWidth={2.8} /> : <ArrowDown size={25} strokeWidth={2.8} />}
            </button>
        </div>
        <div className={panelClasses} aria-live="polite" aria-busy={loading}>
            {!loading && !loadError && costumes.length === 0 && <div className="affinity-story-message">{t.affinityNoCharacters}</div>}
            {!loading && !loadError && costumes.length > 0 && visibleCostumes.length === 0 && <div className="affinity-story-message">{t.affinityNoSearchResults}</div>}
            {!loading && !loadError && pageCostumes.map((costume, index) => <article className={`story-list-card affinity-character-card ${bouncingStudentId === costume.CostumeGroupId ? "story-list-card-bounce" : ""}`} key={costume.CostumeGroupId} style={{ "--card-index": index }} onClick={() => handleStudentClick(costume)} onKeyDown={(event) => handleStudentKeyDown(event, costume)} role="button" tabIndex={flipPhase ? -1 : 0} aria-label={getCostumeDisplayName(costume, language)} aria-disabled={Boolean(flipPhase)} data-card-index={index} data-character-id={costume.CostumeGroupId} data-spine-resource-name={costume.SpineResourceName} data-collection-bg-texture-path={costume.CollectionBGTexturePath} data-campaign-complete-animation-name={costume.CampaignCompleteAnimationName} data-campaign-fail-animation-name={costume.CampaignFailAnimationName}>
                <img className="affinity-character-portrait" src={getCostumeCollectionTextureUrl(costume.CollectionTexturePath)} alt={getCostumeDisplayName(costume, language)} loading="lazy" draggable="false" />
                <div className="affinity-character-name">{getCostumeDisplayName(costume, language)}</div>
            </article>)}
        </div>
        {loading && <div className="affinity-story-loading-overlay" role="status">{t.affinityLoading}</div>}
        {!loading && loadError && <div className="affinity-story-error-overlay" role="alert"><div className="affinity-story-error-card"><p>{t.affinityLoadFailed}</p><button type="button" onClick={retryLoad}>{t.affinityRetry}</button></div></div>}
    </section>;
}
