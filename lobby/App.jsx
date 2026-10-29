import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Howler } from "howler";
import { TEXT } from "../public/texts.js";
import { LANGUAGE_HTML_MAP, AUDIO_FILES, RESOURCE_ROOT, asset, audioAsset, loadResources, getScenarioScriptUrl } from "../public/utils.ts";
import { useOrientation } from "./hooks/useOrientation";
import { useClickEffect } from "./hooks/useClickEffect";
import { Header } from "./components/Header";
import { StoryCard } from "./components/StoryCard";
import { ArchivePanel } from "./components/ArchivePanel";
import { WORK_STORY_PAGES_BY_PAGE } from "./stories/WorkStories.js";
import { OrientationOverlay } from "./components/OrientationOverlay";
import { StoryListPanel } from "./components/StoryListPanel";
import { StoryDetailPanel } from "./components/StoryDetailPanel";
import { StoryInfoModal } from "./components/StoryInfoModal";
import { CLUB_STORY_PAGES } from "./stories/ClubStories.js";
import { MINI_STORY_PAGES } from "./stories/MiniStories.js";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import StoryPlayer from "./components/StoryPlayerHost";

export function App({ active = true } = {}) {
  const [activeMain, setActiveMain] = useState(1);
  const [selected, setSelected] = useState("");
  const [language, setLanguageState] = useState(() => {
    try { const value = localStorage.getItem("ba-story-language"); return ["cn", "en", "kr", "jp", "tw", "th"].includes(value) ? value : "cn"; } catch { return "cn"; }
  });
  const setLanguage = (value) => {
    const next = ["cn", "en", "kr", "jp", "tw", "th"].includes(value) ? value : "cn";
    setLanguageState(next);
    try { localStorage.setItem("ba-story-language", next); } catch {}
    window.dispatchEvent(new CustomEvent("ba-story-language-change", { detail: next }));
  };
  const [voiceLanguage, setVoiceLanguageState] = useState(() => {
    try { const value = localStorage.getItem("ba-story-voice-language"); return ["cn", "jp", "kr"].includes(value) ? value : "jp"; } catch { return "jp"; }
  });
  const [userName, setUserNameState] = useState(() => {
    try { return localStorage.getItem("ba-story-user-name") || "sensei"; } catch { return "sensei"; }
  });
  const setVoiceLanguage = (value) => {
    const next = ["cn", "jp", "kr"].includes(value) ? value : "jp";
    setVoiceLanguageState(next);
    try { localStorage.setItem("ba-story-voice-language", next); } catch {}
    window.dispatchEvent(new CustomEvent("ba-story-voice-language-change", { detail: next }));
  };
  const setUserName = (value) => {
    setUserNameState(value);
    try { localStorage.setItem("ba-story-user-name", value); } catch {}
    window.dispatchEvent(new CustomEvent("ba-story-user-name-change", { detail: value }));
  };
  const loadAndPlayEpisode = async (story, episode) => {
    const groupId = Number(episode?.GroupId);
    const url = getScenarioScriptUrl(groupId);
    const requestId = ++storyLoadRequestRef.current;
    setStoryLoading(true);
    setStoryLoadError("");
    setFailedStorySelection({ story, episode });
    setLoadedStoryData(null);
    if (!url || !Number.isInteger(groupId)) {
      setStoryLoadError((TEXT[language] || TEXT.cn).storyLoadMissingGroupId);
      setStoryLoading(false);
      return;
    }
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.content) || data.content.length === 0) throw new Error("INVALID_STORY_DATA");
      if (requestId !== storyLoadRequestRef.current) return;
      setLoadedStoryData(data);
      setPlayerReplayKey(0);
      setPlayingStorySelection({ story, episode });
    } catch (error) {
      if (requestId === storyLoadRequestRef.current) {
        const messages = TEXT[language] || TEXT.cn;
        const detail = error?.message === "INVALID_STORY_DATA" ? messages.storyLoadInvalidData : (error?.message || messages.storyLoadInvalidData);
        setStoryLoadError(messages.storyLoadFailed.replace("{groupId}", String(groupId)).replace("{error}", detail));
      }
    } finally {
      if (requestId === storyLoadRequestRef.current) setStoryLoading(false);
    }
  };
  const [resourcesReady, setResourcesReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingAvatarIndex, setLoadingAvatarIndex] = useState(0);
  const loadingAvatarRef = useRef(null);
  const loadingProgressRef = useRef(0);
  const resourcesReadyRef = useRef(false);
  const bgImage = "/assets/Growth_Bg.png";
  const [sceneEntering, setSceneEntering] = useState(false);
  const [sceneEntryKey, setSceneEntryKey] = useState(0);
  const [groupStoryOpen, setGroupStoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [workStoryOpen, setWorkStoryOpen] = useState(false);
  const [workDetailOpen, setWorkDetailOpen] = useState(false);
  const [selectedWorkStory, setSelectedWorkStory] = useState(null);
  const [miniStoryMode, setMiniStoryMode] = useState(false);
  const [clubDetailOpen, setClubDetailOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyInfoSelection, setStoryInfoSelection] = useState(null);
  const [playingStorySelection, setPlayingStorySelection] = useState(null);
  const [loadedStoryData, setLoadedStoryData] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyLoadError, setStoryLoadError] = useState("");
  const [failedStorySelection, setFailedStorySelection] = useState(null);
  const storyLoadRequestRef = useRef(0);
  const [playerReplayKey, setPlayerReplayKey] = useState(0);
  const detailTransitionLock = useRef(false);
  const workDetailTransitionLock = useRef(false);
  const [storyTransitionPending, setStoryTransitionPending] = useState(false);
  const [blackout, setBlackout] = useState("");
  const [storyPageIndex, setStoryPageIndex] = useState(0);
  const [flipPhase, setFlipPhase] = useState("");
  const [flipDirection, setFlipDirection] = useState("next");
  const pageFlipTimer = useRef(null);
  const sceneTransitionTimer = useRef(null);


  useEffect(() => {
    if (!playingStorySelection) return undefined;
    const handleReplayRequest = () => {
      // 改变 key 会完整卸载旧 Vue/Pixi/音频实例，再创建新播放器并重新加载剧情资源。
      setPlayerReplayKey((key) => key + 1);
    };
    window.addEventListener("ba-player-replay-request", handleReplayRequest);
    return () => window.removeEventListener("ba-player-replay-request", handleReplayRequest);
  }, [playingStorySelection]);

  useEffect(() => {
    const onLanguageChange = (event) => {
      const value = event.detail;
      if (["cn", "en", "kr", "jp", "tw", "th"].includes(value)) {
        setLanguageState(value);
        try { localStorage.setItem("ba-story-language", value); } catch {}
      }
    };
    const onVoiceLanguageChange = (event) => {
      const value = event.detail;
      if (["cn", "jp", "kr"].includes(value)) {
        setVoiceLanguageState(value);
        try { localStorage.setItem("ba-story-voice-language", value); } catch {}
      }
    };
    const onUserNameChange = (event) => {
      const value = String(event.detail ?? "");
      setUserNameState(value);
      try { localStorage.setItem("ba-story-user-name", value); } catch {}
    };
    window.addEventListener("ba-story-language-change", onLanguageChange);
    window.addEventListener("ba-story-voice-language-change", onVoiceLanguageChange);
    window.addEventListener("ba-story-user-name-change", onUserNameChange);
    return () => {
      window.removeEventListener("ba-story-language-change", onLanguageChange);
      window.removeEventListener("ba-story-voice-language-change", onVoiceLanguageChange);
      window.removeEventListener("ba-story-user-name-change", onUserNameChange);
    };
  }, []);

  const { portrait, isMobile, showRotatePrompt, enterLandscape } = useOrientation();
  const t = TEXT[language];
  const audioRef = useRef(null);
  const buttonTouchAudioRef = useRef(null);
  const menuBgmBlockedRef = useRef(false);
  const bgmUnlockHandlerRef = useRef(null);

  // 全局点击特效（蔚蓝档案光环粒子：横屏显示；竖屏模式或出现横屏提示遮罩时不触发、不显示）
  useClickEffect(showRotatePrompt || (isMobile && portrait));

  const stopMenuAudio = () => {
    menuBgmBlockedRef.current = true;
    if (bgmUnlockHandlerRef.current) {
      window.removeEventListener("pointerdown", bgmUnlockHandlerRef.current);
      window.removeEventListener("keydown", bgmUnlockHandlerRef.current);
      window.removeEventListener("click", bgmUnlockHandlerRef.current);
      bgmUnlockHandlerRef.current = null;
    }
    const stopMedia = (media) => {
      try {
        media.pause();
        media.currentTime = 0;
        media.removeAttribute("autoplay");
      } catch {}
    };
    if (audioRef.current) stopMedia(audioRef.current);
    if (buttonTouchAudioRef.current) stopMedia(buttonTouchAudioRef.current);
    document.querySelectorAll("audio, video").forEach(stopMedia);
    Howler.stop();
    try {
      const context = Howler.ctx;
      if (context && context.state === "running") context.suspend();
    } catch {}
  };

  // 卡片点击音效播放函数
  const playButtonTouchSound = () => {
    try {
      if (!buttonTouchAudioRef.current) return;
      buttonTouchAudioRef.current.currentTime = 0;
      buttonTouchAudioRef.current.play().catch(() => {});
    } catch {
      // 容错处理
    }
  };

  // 使用原版 Loading 组件的 GSAP 跳动与角色切换逻辑。
  useEffect(() => {
    if ((loadingComplete && resourcesReady) || !loadingAvatarRef.current) return;
    let skipRepeat = false;
    const tween = gsap.from(loadingAvatarRef.current, {
      y: -30,
      duration: 0.5,
      ease: "power1.in",
      repeat: -1,
      yoyo: true,
      onRepeat: () => {
        if (skipRepeat) {
          skipRepeat = false;
          return;
        }
        skipRepeat = true;
        setLoadingAvatarIndex((current) => {
          let next;
          do { next = Math.floor(Math.random() * 4); } while (next === current);
          return next;
        });
      },
    });
    return () => tween.kill();
  }, [loadingComplete, resourcesReady]);

  // 进度直接使用 loadResources 的真实资源完成比例，不再用定时器模拟增长。
  useEffect(() => {
    if (loadingComplete) return;
    loadingProgressRef.current = loadingProgress;
  }, [loadingProgress, loadingComplete]);

  // 资源（图片、字体、音频）预加载
  useEffect(() => {
    let alive = true;
    setLoadingProgress(0);
    setLoadingComplete(false);
    loadResources(language, (progress) => {
      if (alive) {
        loadingProgressRef.current = progress;
        setLoadingProgress(progress);
      }
    }).then((loadedRes) => {
      if (!alive) return;
      const themeAudio = loadedRes?.audios?.find((item) => item.key === "theme12")?.audio;
      const buttonTouchAudio = loadedRes?.audios?.find((item) => item.key === "buttonTouch")?.audio;
      if (themeAudio) {
        themeAudio.loop = true;
        audioRef.current = themeAudio;
      }
      if (buttonTouchAudio) buttonTouchAudioRef.current = buttonTouchAudio;
    }).finally(() => {
      if (alive) {
        setLoadingProgress(100);
        setLoadingComplete(true);
        setResourcesReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // 更新页面标题和语言属性
  useEffect(() => {
    document.documentElement.lang = LANGUAGE_HTML_MAP[language] || "en";
    document.title = t.pageTitle;
  }, [language, t.pageTitle]);

  // 背景音乐播放控制：
  // 电脑端（非移动端）：无论窗口长宽比如何，均应正常播放音乐；
  // 移动端：横屏时播放，竖屏（展示横屏旋转提示时）暂停音乐。
  useEffect(() => {
    if (!resourcesReady) return;

    if (!audioRef.current) {
      const audio = new Audio(audioAsset(AUDIO_FILES.theme12));
      audio.loop = true;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const playAudio = () => {
      if (menuBgmBlockedRef.current || playingStorySelection) return;
      if (audio.paused) {
        audio.play().catch(() => {
          const unlock = () => {
            if (!menuBgmBlockedRef.current && !playingStorySelection) {
              audio.play().catch(() => {});
            }
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
            window.removeEventListener("click", unlock);
            if (bgmUnlockHandlerRef.current === unlock) bgmUnlockHandlerRef.current = null;
          };
          bgmUnlockHandlerRef.current = unlock;
          window.addEventListener("pointerdown", unlock, { once: true });
          window.addEventListener("keydown", unlock, { once: true });
          window.addEventListener("click", unlock, { once: true });
        });
      }
    };

    if (playingStorySelection) {
      stopMenuAudio();
      return;
    }

    menuBgmBlockedRef.current = false;
    const shouldPlayBgm = !menuBgmBlockedRef.current && (!isMobile || !portrait);

    if (shouldPlayBgm) {
      playAudio();
    } else {
      audio.pause();
    }
  }, [portrait, isMobile, resourcesReady, playingStorySelection]);

  // 组件卸载时释放音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (buttonTouchAudioRef.current) {
        buttonTouchAudioRef.current.pause();
        buttonTouchAudioRef.current = null;
      }
      if (pageFlipTimer.current) window.clearTimeout(pageFlipTimer.current);
      if (sceneTransitionTimer.current) window.clearTimeout(sceneTransitionTimer.current);
    };
  }, []);

  // 入场动效管理：横屏就绪、由竖屏转横屏、或切换回当前页面时播放非线性入场动画
  useEffect(() => {
    if (!resourcesReady || portrait || !active) {
      setSceneEntering(false);
      return;
    }

    setSceneEntering(true);
    const timer = setTimeout(() => {
      setSceneEntering(false);
    }, 850);

    return () => clearTimeout(timer);
  }, [resourcesReady, portrait, active]);

  // 主线卡片点击逻辑：
  // 处于底层（非 active）时点击只切换顺序，不算作有效点击，不触发弹跳；
  // 仅当已经是上层（active）时再次点击，才算作有效点击并触发弹跳反馈与音效
  const handleMainCardClick = (id, key) => {
    playButtonTouchSound();
    if (activeMain !== id) {
      setActiveMain(id);
      return false; // 非有效点击
    }
    setSelected(key);
    return true; // 有有效点击
  };

  const handleCardClick = (key) => {
    playButtonTouchSound();
    setSelected(key);
    if (key === "club" || key === "mini") setStoryTransitionPending(true);
    return true;
  };

  const clearSceneTransition = () => {
    if (sceneTransitionTimer.current) window.clearTimeout(sceneTransitionTimer.current);
    sceneTransitionTimer.current = null;
  };

  // 先让黑幕完全覆盖页面，再切换 React 页面状态，最后淡出黑幕，避免旧页面在黑幕消失后短暂露出。
  const runBlackoutTransition = (switchPage) => {
    clearSceneTransition();
    setBlackout("cover");
    sceneTransitionTimer.current = window.setTimeout(() => {
      switchPage();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBlackout("fade");
          sceneTransitionTimer.current = window.setTimeout(() => {
            setBlackout("");
            sceneTransitionTimer.current = null;
          }, 220);
        });
      });
    }, 620);
  };

  const returnToScenarioMenu = () => {
    detailTransitionLock.current = false;
    workDetailTransitionLock.current = false;
    if (workStoryOpen && workDetailOpen) { runBlackoutTransition(() => { setWorkDetailOpen(false); setSelectedWorkStory(null); setStoryInfoSelection(null); }); return; }
    if (workStoryOpen) { runBlackoutTransition(() => { setWorkStoryOpen(false); setArchiveOpen(true); setStoryPageIndex(0); }); return; }
    if (archiveOpen) { runBlackoutTransition(() => { setArchiveOpen(false); setSelected(""); setActiveMain(1); setStoryTransitionPending(false); setSceneEntering(false); setSceneEntryKey((key) => key + 1); requestAnimationFrame(() => { setSceneEntering(true); window.setTimeout(() => setSceneEntering(false), 850); }); }); return; }
    setClubDetailOpen(false);
    setSelectedStory(null);
    setStoryInfoSelection(null);
    if (pageFlipTimer.current) window.clearTimeout(pageFlipTimer.current);
    pageFlipTimer.current = null;
    runBlackoutTransition(() => {
      setGroupStoryOpen(false);
      setMiniStoryMode(false);
      setClubDetailOpen(false);
      setSelectedStory(null);
      setSelected("");
      setActiveMain(1);
      setStoryTransitionPending(false);
      setFlipPhase("");
      setFlipDirection("next");
      setStoryPageIndex(0);
      setSceneEntering(false);
      setSceneEntryKey((key) => key + 1);
      requestAnimationFrame(() => {
        setSceneEntering(true);
        window.setTimeout(() => setSceneEntering(false), 850);
      });
    });
  };

  // 翻页时先显示空白纸面，再翻动右半页；切换数据后禁用卡片入场动画，避免旧页残影与延迟显示。
  const flipStoryPage = (direction = "next") => {
    if (flipPhase) return;
    const pageCount = workStoryOpen ? WORK_STORY_PAGES_BY_PAGE.length : miniStoryMode ? MINI_STORY_PAGES.length : CLUB_STORY_PAGES.length;
    const nextIndex = direction === "next" ? Math.min(pageCount - 1, storyPageIndex + 1) : Math.max(0, storyPageIndex - 1);
    if (nextIndex === storyPageIndex) return;
    playButtonTouchSound();
    setFlipDirection(direction);
    setFlipPhase("blank");
    if (pageFlipTimer.current) window.clearTimeout(pageFlipTimer.current);
    pageFlipTimer.current = window.setTimeout(() => {
      setFlipPhase("turning");
      pageFlipTimer.current = window.setTimeout(() => {
        setStoryPageIndex(nextIndex);
        setFlipPhase("revealing");
        pageFlipTimer.current = window.setTimeout(() => {
          setFlipPhase("");
          pageFlipTimer.current = null;
        }, 40);
      }, 650);
    }, 160);
  };

  const finishStoryCardBounce = () => {
    if (selected === "archive") {
      setSelected("");
      runBlackoutTransition(() => setArchiveOpen(true));
      return;
    }
    if (!storyTransitionPending || groupStoryOpen) return;
    const openMini = selected === "mini";
    setStoryTransitionPending(false);
    runBlackoutTransition(() => {
      setSelected("");
      setMiniStoryMode(openMini);
      setStoryPageIndex(0);
      setFlipPhase("");
      setFlipDirection("next");
      setGroupStoryOpen(true);
    });
  };

  const openStoryDetail = (story) => {
    if (detailTransitionLock.current || !story) return;
    detailTransitionLock.current = true;
    setSelectedStory(story);
    setStoryInfoSelection(null);
    runBlackoutTransition(() => { setClubDetailOpen(true); detailTransitionLock.current = false; });
  };
  const openWorkDetail = (story) => {
    if (workDetailTransitionLock.current || !story) return;
    workDetailTransitionLock.current = true;
    setSelectedWorkStory(story);
    setStoryInfoSelection(null);
    runBlackoutTransition(() => { setWorkDetailOpen(true); workDetailTransitionLock.current = false; });
  };
  const closeWorkDetail = () => {
    if (workDetailTransitionLock.current) return;
    workDetailTransitionLock.current = true;
    runBlackoutTransition(() => { setWorkDetailOpen(false); setSelectedWorkStory(null); setStoryInfoSelection(null); workDetailTransitionLock.current = false; });
  };
  const closeStoryDetail = () => {
    if (detailTransitionLock.current) return;
    detailTransitionLock.current = true;
    runBlackoutTransition(() => { setClubDetailOpen(false); setStoryInfoSelection(null); detailTransitionLock.current = false; });
  };

  if (!resourcesReady || !loadingComplete) {
    const avatarUrls = [
      "https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/avatar1.c18ce793.png",
      "https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/avatar2.916294c1.png",
      "https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/avatar3.5e643647.png",
      "https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/avatar4.be61bf91.png",
    ];
    return (
      <main className="loading_wrapper" aria-live="polite" aria-busy="true">
        <div className="avatar_img" ref={loadingAvatarRef} aria-hidden="true">
          <img src={avatarUrls[loadingAvatarIndex]} alt="" />
          <div className="hide">
            {avatarUrls.map((src, index) => <img key={index} src={src} alt="" />)}
          </div>
        </div>
        <div className="progress_wrapper">
          <h1 className="title"> connecting... </h1>
          <div className="percent">{Math.floor(loadingProgress > 100 ? 100 : loadingProgress)}%</div>
          <div className="loading_progress_track" role="progressbar" aria-label="Loading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(loadingProgress)}><div className="loading_progress_fill" style={{ width: `${Math.min(100, Math.max(0, loadingProgress))}%` }} /></div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`screen ${sceneEntering ? "scene-entering" : ""} ${groupStoryOpen ? "group-story-screen" : ""} ${(archiveOpen || workStoryOpen) ? "archive-screen" : ""}`}
      style={{
        backgroundColor: "#fff",
        backgroundImage: `url("${bgImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
    <Header t={(archiveOpen || workStoryOpen) ? { ...t, pageTitle: t.archiveTitle } : groupStoryOpen ? { ...t, pageTitle: miniStoryMode ? t.affinity : (clubDetailOpen ? t.clubDetailTitle : t.clubTitle) } : t} language={language} setLanguage={setLanguage} voiceLanguage={voiceLanguage} setVoiceLanguage={setVoiceLanguage} userName={userName} setUserName={setUserName} isClubDetail={groupStoryOpen && clubDetailOpen}/>
      <section key={sceneEntryKey} className={`story-layout ${(archiveOpen || workStoryOpen) ? "story-layout-hidden" : ""}`} aria-label={t.pageTitle}>
        <div className="main-stack">
          <StoryCard
            className="main-card-back"
            image="Scenario_Title_01_2.png"
            background="Scenario_Mode_Bg_1.png"
            label={t.main2}
            subtitle={t.main2Sub}
            main
            active={activeMain === 2}
            onClick={() => handleMainCardClick(2, "main2")}
          />
          <StoryCard
            className="main-card-front"
            image="Scenario_Title_01_1.png"
            background="Scenario_Mode_Bg_1.png"
            label={t.main1}
            subtitle={t.main1Sub}
            main
            active={activeMain === 1}
            onClick={() => handleMainCardClick(1, "main1")}
          />
        </div>
        <div className="scenario-right-top">
          <StoryCard
            className="small-card affinity"
            image="Scenario_Title_02.png"
            background="Scenario_Mode_Bg_2.png"
            label={t.affinity}
            subtitle={t.affinitySub}
            onClick={() => handleCardClick("mini")}
            onBounceComplete={finishStoryCardBounce}
          />
          <StoryCard
            className="small-card club"
            image="Scenario_Title_03.png"
            background="Scenario_Mode_Bg_2.png"
            label={t.club}
            subtitle={t.clubSub}
            onClick={() => handleCardClick("club")}
            onBounceComplete={finishStoryCardBounce}
          />
        </div>
        <StoryCard
          className="archive-card"
          image="Scenario_Title_04.png"
          background="Scenario_Mode_Bg_3.png"
          label={t.archive}
          subtitle={t.archiveSub}
          onClick={() => handleCardClick("archive")}
          onBounceComplete={finishStoryCardBounce}
        />
      </section>
      {archiveOpen && !workStoryOpen && <>
        <button className="story-list-back-button archive-back-button" type="button" onClick={returnToScenarioMenu} aria-label={t.back}><ArrowLeft size={34} strokeWidth={2.3} /></button>
        <ArchivePanel t={t} onSelect={(key) => { if (key === "archiveWork") { runBlackoutTransition(() => { setStoryPageIndex(0); setFlipPhase(""); setWorkDetailOpen(false); setWorkStoryOpen(true); }); return; } playButtonTouchSound(); window.dispatchEvent(new CustomEvent("ba-archive-replay-select", { detail: key })); }} />
      </>}
      {workStoryOpen && !workDetailOpen && <>
        <button className="story-list-back-button archive-back-button" type="button" onClick={returnToScenarioMenu} aria-label={t.back}><ArrowLeft size={34} strokeWidth={2.3} /></button>
        <StoryListPanel pageIndex={storyPageIndex} language={language} flipPhase={flipPhase} flipDirection={flipDirection} onStorySelect={openWorkDetail} onCardClickSound={playButtonTouchSound} storyType="work" />
        {storyPageIndex > 0 && <button className={`story-list-prev-page-button ${flipPhase ? "is-flipping" : ""}`} type="button" onClick={() => flipStoryPage("previous")} aria-label={t.previousPage} disabled={Boolean(flipPhase)}><ChevronLeft size={43} strokeWidth={2.7} /></button>}
        {storyPageIndex < WORK_STORY_PAGES_BY_PAGE.length - 1 && <button className={`story-list-next-button ${flipPhase ? "is-flipping" : ""}`} type="button" onClick={() => flipStoryPage("next")} aria-label={t.nextPage} disabled={Boolean(flipPhase)}><ChevronRight size={43} strokeWidth={2.7} /></button>}
      </>}
      {workStoryOpen && workDetailOpen && <>
        <button className="story-list-back-button archive-back-button" type="button" onClick={closeWorkDetail} aria-label={t.back}><ArrowLeft size={34} strokeWidth={2.3} /></button>
        <StoryDetailPanel story={selectedWorkStory} pageIndex={storyPageIndex} language={language} onBack={closeWorkDetail} storyType="work" onEpisodeSelect={(story, episode) => setStoryInfoSelection({ story, episode })} />
        {storyInfoSelection && <StoryInfoModal story={storyInfoSelection.story} episode={storyInfoSelection.episode} language={language} onClose={() => setStoryInfoSelection(null)} onEnter={(story, episode) => { stopMenuAudio(); playButtonTouchSound(); setStoryInfoSelection(null); void loadAndPlayEpisode(story, episode); }} />}
      </>}
      {groupStoryOpen && !clubDetailOpen && (<>
        <button className="story-list-back-button" type="button" onClick={returnToScenarioMenu} aria-label={t.back}><ArrowLeft size={34} strokeWidth={2.3} /></button>
        <StoryListPanel pageIndex={storyPageIndex} language={language} flipPhase={flipPhase} flipDirection={flipDirection} onStorySelect={openStoryDetail} onCardClickSound={playButtonTouchSound} storyType={miniStoryMode ? "mini" : "club"} />
        {storyPageIndex > 0 && <button className={`story-list-prev-page-button ${flipPhase ? "is-flipping" : ""}`} type="button" onClick={() => flipStoryPage("previous")} aria-label={t.previousPage} disabled={Boolean(flipPhase)}><ChevronLeft size={43} strokeWidth={2.7} /></button>}
        {storyPageIndex < (miniStoryMode ? MINI_STORY_PAGES.length : CLUB_STORY_PAGES.length) - 1 && <button className={`story-list-next-button ${flipPhase ? "is-flipping" : ""}`} type="button" onClick={() => flipStoryPage("next")} aria-label={t.nextPage} disabled={Boolean(flipPhase)}><ChevronRight size={43} strokeWidth={2.7} /></button>}
      </>)}
      {groupStoryOpen && clubDetailOpen && <>
        <button className="story-list-back-button" type="button" onClick={closeStoryDetail} aria-label={t.back}><ArrowLeft size={34} strokeWidth={2.3} /></button>
        <StoryDetailPanel story={selectedStory} pageIndex={storyPageIndex} language={language} onBack={closeStoryDetail} storyType={miniStoryMode ? "mini" : "club"} onEpisodeSelect={(story, episode) => setStoryInfoSelection({ story, episode })} />
        {storyInfoSelection && <StoryInfoModal story={storyInfoSelection.story} episode={storyInfoSelection.episode} language={language} onClose={() => setStoryInfoSelection(null)} onEnter={(story, episode) => { stopMenuAudio(); playButtonTouchSound(); setStoryInfoSelection(null); void loadAndPlayEpisode(story, episode); }} />}
      </>}
      {playingStorySelection && loadedStoryData && <StoryPlayer
        className="ba-story-player-page"
        key={`${playingStorySelection.story?.id ?? "story"}-${playingStorySelection.episode?.id ?? "episode"}-${playerReplayKey}`}
        story={loadedStoryData}
        dataUrl={RESOURCE_ROOT}
        width={Math.max(1, window.innerWidth)}
        height={Math.max(1, window.innerHeight)}
        language={({ cn: "Cn", en: "En", jp: "Jp", tw: "Tw", kr: "Kr", th: "Th" })[language] || "Cn"}
        voiceLanguage={voiceLanguage}
        userName={userName}
        storySummary={{ chapterName: playingStorySelection.episode?.title || playingStorySelection.story?.title || "剧情", summary: playingStorySelection.episode?.description || `${playingStorySelection.episode?.title || playingStorySelection.story?.title || "剧情"}。` }}
        startFullScreen={false}
        useMp3={false}
        useSuperSampling={false}
        onError={() => {}}
      />}
      {storyLoading && <div role="status" style={{ position: "fixed", inset: 0, zIndex: 2147483001, display: "grid", placeItems: "center", background: "rgba(8, 16, 28, .82)", color: "#fff", fontSize: "clamp(18px, 2vw, 28px)", fontWeight: 700 }}>{(TEXT[language] || TEXT.cn).storyLoading}</div>}
      {storyLoadError && <div role="alert" style={{ position: "fixed", inset: 0, zIndex: 2147483002, display: "grid", placeItems: "center", background: "rgba(8, 16, 28, .86)", padding: 24 }}>
        <div style={{ maxWidth: 520, width: "100%", padding: 24, borderRadius: 12, background: "#fff", color: "#26364b", textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.28)" }}>
          <p style={{ margin: "0 0 18px", overflowWrap: "anywhere" }}>{storyLoadError}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button type="button" onClick={() => { const target = failedStorySelection; setStoryLoadError(""); if (target) void loadAndPlayEpisode(target.story, target.episode); }} style={{ padding: "9px 18px", border: 0, borderRadius: 7, background: "#344f7e", color: "#fff", cursor: "pointer" }}>{(TEXT[language] || TEXT.cn).retry}</button>
            <button type="button" onClick={() => { setStoryLoadError(""); setFailedStorySelection(null); }} style={{ padding: "9px 18px", border: "1px solid #b8c0cc", borderRadius: 7, background: "#fff", color: "#344f7e", cursor: "pointer" }}>{(TEXT[language] || TEXT.cn).close}</button>
          </div>
        </div>
      </div>}
      {blackout && <div className={`story-scene-blackout ${blackout === "fade" ? "is-fading" : "is-cover"}`} aria-hidden="true" />}
      {showRotatePrompt && (
        <OrientationOverlay t={t} onEnterLandscape={enterLandscape} />
      )}
    </main>
  );
}
