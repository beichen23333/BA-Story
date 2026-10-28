<script lang="ts" setup>
import {
  continuePlay,
  dispose,
  eventEmitter,
  init,
  stop,
  storyHandler,
} from "@/index";
import { isMobile } from "pixi.js";
import {
  computed,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from "vue";
import { useDocumentVisibility } from "@vueuse/core";
import { changeStoryIndex } from "./layers/uiLayer/userInteract";
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import { translate } from "@/layers/translationLayer";
import { buildStoryIndexStackRecord } from "@/layers/translationLayer/utils";
import BaUI from "@/layers/uiLayer/BaUI.vue";
import { useUiState } from "@/stores/state";
import { StoryRawUnit, TranslatedStoryUnit } from "@/types/common";
import { Language, StorySummary } from "@/types/store";
import { useElementSize } from "@vueuse/core";
import eventBus from "./eventBus";
import BAClickFX from "ba-click-fx";
import { initPrivateState, usePlayerStore } from "./stores";

export type PlayerProps = {
  story: TranslatedStoryUnit;
  dataUrl: string;
  width: number;
  height: number;
  language: Language;
  voiceLanguage?: string;
  userName: string;
  storySummary: StorySummary;
  startFullScreen?: boolean;
  useMp3?: boolean;
  useSuperSampling?: "2" | "4" | "" | boolean;
  /** 跳转至传入的 index */
  changeIndex?: number;
  /**
   * 播放结束等待多久后退出全屏操作
   */
  exitFullscreenTimeOut?: number;
  /**
   * 是否启用蔚蓝档案点击特效
   */
  enableClickFx?: boolean;
};

const props = withDefaults(defineProps<PlayerProps>(), {
  voiceLanguage: "jp",
  startFullScreen: false,
  useMp3: false,
  enableClickFx: true,
});
const storySummary = ref({ ...props.storySummary });
storySummary.value.summary = storySummary.value.summary.replaceAll("[USERNAME]", props.userName);
watch(() => props.userName, (value) => {
  initPrivateState().userName = value;
  storySummary.value = {
    ...props.storySummary,
    summary: props.storySummary.summary.replaceAll("[USERNAME]", value),
  };
});
const emit = defineEmits(["end", "error", "initiated"]);
watch(() => props.language, (value) => {
  try {
    const state = initPrivateState();
    state.language = value;
    const currentIndex = storyHandler.currentStoryIndex;
    const translatedUnits = translate(props.story);
    state.allStoryUnit = translatedUnits;
    state.stackStoryUnit = buildStoryIndexStackRecord(translatedUnits);
    if (translatedUnits.length > 0) {
      storyHandler.currentStoryIndex = Math.min(currentIndex, translatedUnits.length - 1);
    }
  } catch (error) {
    console.warn("切换剧情语言失败", error);
  }
});


const playerHeight = ref(props.height);
const playerWidth = ref(props.width);
watch([() => props.width, () => props.height], () => {
  if (!fullScreen.value) {
    try { screen.orientation?.unlock?.(); } catch (error) { /* ignore */ }
    playerWidth.value = props.width;
    playerHeight.value = props.height;
  }
});
watch(
  () => props.changeIndex,
  () => {
    if (props.changeIndex !== undefined) {
      changeStoryIndex(props.changeIndex);
    }
  }
);

const player = ref<HTMLDivElement>();
let clickFxInstance: BAClickFX | null = null;
const { width: playerActualWidth, height: playerActualHeight } =
  useElementSize(player);

watch([playerActualWidth, playerActualHeight], () => {
  if (!fullScreen.value || isMobile.phone || isPseudoFullscreen.value) {
    return;
  }

  playerWidth.value = playerActualWidth.value;
  playerHeight.value = playerActualHeight.value;
});

const playerStyle = computed(() => {
  return { height: `${playerHeight.value}px`, width: `${playerWidth.value}px` };
});

const isPseudoFullscreen = ref(false);

const fullScreen = ref(props.startFullScreen);
watch(fullScreen, updateFullScreenState);
/**
 * 强制横屏使播放器居中的top值
 */
const fullscreenTopOffset = computed(() => {
  return "100%";
});

/**
 * 根据fullScreen值更新播放器状态
 */
async function updateFullScreenState() {
  const currentFullScreenState = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || (document as any).msFullscreenElement);
  if (fullScreen.value) {
    if (!currentFullScreenState && !isPseudoFullscreen.value) {
      const target = player.value as any;
      try {
        if (target?.requestFullscreen) await target.requestFullscreen({ navigationUI: "hide" });
        else if (target?.webkitRequestFullscreen) await target.webkitRequestFullscreen();
        else if (target?.webkitRequestFullScreen) await target.webkitRequestFullScreen();
        else if (target?.mozRequestFullScreen) await target.mozRequestFullScreen();
        else if (target?.msRequestFullscreen) await target.msRequestFullscreen();
        else {
          isPseudoFullscreen.value = true;
          target?.classList.add("pseudo-fullscreen");
        }
      } catch (error) {
        isPseudoFullscreen.value = true;
        target?.classList.add("pseudo-fullscreen");
      }
    }
    // 全屏铺满视口，并切换到与当前方向相反的方向。
    playerWidth.value = Math.max(1, window.innerWidth);
    playerHeight.value = Math.max(1, window.innerHeight);
    try {
      if (screen.orientation?.lock) {
        const isLandscape = screen.orientation.type?.startsWith("landscape") ?? window.matchMedia("(orientation: landscape)").matches;
        await screen.orientation.lock(isLandscape ? "portrait" : "landscape");
      }
    } catch (error) { /* 部分浏览器只允许在用户手势中锁定方向 */ }
  } else {
    if (currentFullScreenState) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        else if ((document as any).webkitCancelFullScreen) await (document as any).webkitCancelFullScreen();
        else if ((document as any).mozCancelFullScreen) await (document as any).mozCancelFullScreen();
        else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
      } catch (error) {
        console.warn("退出全屏失败", error);
      }
    }
    if (isPseudoFullscreen.value) {
      isPseudoFullscreen.value = false;
      player.value?.classList.remove("pseudo-fullscreen");
    }
    player.value?.classList.remove("manual-portrait-layout", "manual-landscape-layout");
    playerWidth.value = props.width;
    playerHeight.value = props.height;
  }
}

const handleViewportResize = () => {
  if (fullScreen.value) { playerWidth.value = Math.max(1, window.innerWidth); playerHeight.value = Math.max(1, window.innerHeight); }
};
async function toggleScreenOrientation() {
  // 先确保播放器进入全屏；菜单事件可能与 fullscreenchange 同帧触发，不能只依赖旧的 fullScreen 值。
  if (!fullScreen.value) {
    fullScreen.value = true;
    await updateFullScreenState();
  }
  const orientation = screen.orientation;
  const isLandscape = orientation?.type?.startsWith("landscape") ?? window.matchMedia("(orientation: landscape)").matches;
  const targetOrientation = isLandscape ? "portrait" : "landscape";
  try {
    if (orientation?.lock) {
      // 必须在菜单点击触发的调用链中立即请求，避免丢失用户手势权限。
      await orientation.lock(targetOrientation);
      return;
    }
  } catch (error) {
    console.warn("浏览器拒绝锁定屏幕方向，改用播放器方向布局", error);
  }
  // 不支持 Screen Orientation API（或系统拒绝锁定）时，仍切换播放器布局，避免按钮完全无响应。
  const target = player.value;
  if (!target) return;
  const manualPortrait = target.classList.toggle("manual-portrait-layout");
  if (manualPortrait) {
    playerWidth.value = Math.max(1, window.innerHeight);
    playerHeight.value = Math.max(1, window.innerWidth);
  } else {
    playerWidth.value = Math.max(1, window.innerWidth);
    playerHeight.value = Math.max(1, window.innerHeight);
  }
  target.classList.toggle("manual-landscape-layout", !manualPortrait);
}
window.addEventListener("resize", handleViewportResize);
window.addEventListener("orientationchange", handleViewportResize);
eventBus.on("toggleScreenOrientation", toggleScreenOrientation);

/**
 * 指定canvas一个固定的height保证画面表现
 */
const pixiHeight = 1012.5;
const pixiConfig = { ...props, height: pixiHeight };
pixiConfig.width = (pixiHeight * props.width) / props.height; // FIXME: Attempt to assign to const or readonly variable.
const pixiScale = computed(
  //比实际放大一点放置并隐藏解决缩放不精确的问题
  () => (playerHeight.value + 1) / pixiHeight
);
watch([playerWidth, playerHeight], () => {
  const newWidth = (pixiHeight * playerWidth.value) / playerHeight.value;
  const app = usePlayerStore().app;
  const originWidth = app.screen.width;
  if (newWidth.toFixed(2) !== originWidth.toFixed(2)) {
    app.renderer.resize(newWidth, pixiHeight);
    eventBus.emit("resize", originWidth);
  }
});


const prefixes = ["", "moz", "webkit", "ms"];

function handleFullScreenChange() {
  const nativeFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
  // Safari 等不支持原生全屏的环境使用 pseudo-fullscreen；它也必须与菜单按钮共享同一状态。
  fullScreen.value = nativeFullscreen || isPseudoFullscreen.value;
}

function hotReplaceStoryUnit(
  unit: StoryRawUnit | StoryRawUnit[] | TranslatedStoryUnit,
  index: number,
  textOnly = true
) {
  const privateStore = initPrivateState();
  if (textOnly) {
    const translateUnit = translate({
      GroupId: 0,
      translator: "",
      content: [unit as StoryRawUnit],
    });
    eventEmitter.actionByUnitType(translateUnit[0]);
    return;
  }
  if (Object.hasOwn(unit, "ScriptKr")) {
    const translateUnit = translate({
      GroupId: 0,
      translator: "",
      content: [unit as StoryRawUnit],
    });
    privateStore.allStoryUnit.splice(index, 1, translateUnit[0]);
    privateStore.stackStoryUnit = buildStoryIndexStackRecord(
      privateStore.allStoryUnit
    );
    changeStoryIndex(index);
  } else {
    /* eslint-disable indent */
    const newStory: TranslatedStoryUnit = Array.isArray(unit)
      ? {
          GroupId: props.story.GroupId,
          translator: props.story.translator,
          content: unit,
        }
      : (unit as TranslatedStoryUnit);
    /* eslint-enable indent */
    privateStore.allStoryUnit = translate(newStory);
    privateStore.stackStoryUnit = buildStoryIndexStackRecord(
      privateStore.allStoryUnit
    );
    storyHandler.currentStoryIndex = 0;
    storyHandler.isEnd = false;
    storyHandler.storyPlay().then();
  }
}

function resetLive2d() {
  eventBus.emit("live2dDebugDispose");
  const live2dIndex = initPrivateState().allStoryUnit.findIndex(it => it.l2d);
  if (live2dIndex !== -1) {
    changeStoryIndex(live2dIndex);
  }
}

defineExpose({
  hotReplaceStoryUnit,
  resetLive2d,
  app: toRef(() => usePlayerStore().app),
});

/**
 * 是否经历过setup onMounted
 */
let firstMount = false;
onMounted(async () => {
  await init(
    "player__main__canvas",
    pixiConfig,
    () => {
      setTimeout(
        () => (fullScreen.value = false),
        props.exitFullscreenTimeOut || 1000
      );
      eventBus.emit("end");
      emit("end");
    },
    () => {
      emit("error");
    }
  );
  eventBus.on("loaded", () => {
    emit("initiated");
  });
  if (props.startFullScreen) {
    updateFullScreenState();
  }
  //保证fullscreen值正确性
  prefixes.forEach(prefix => {
    player.value?.addEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
  if (props.enableClickFx && player.value) {
    try {
      clickFxInstance = new BAClickFX({
        target: player.value,
      });
    } catch (e) {
      console.warn("Failed to initialize BAClickFX:", e);
    }
  }
  firstMount = true;
});

const { tabActivated, autoMode } = useUiState();

autoMode.value = false;

const visibility = useDocumentVisibility();

watch(
  () => visibility.value,
  (newVal: DocumentVisibilityState) => {
    switch (newVal) {
      case "hidden":
        tabActivated.value = true;
        break;
      case "visible":
        tabActivated.value = false;
        break;
    }
  }
);

onUnmounted(() => {
  if (clickFxInstance) {
    try {
      clickFxInstance.destroy();
    } catch (e) {
      console.warn("Failed to destroy BAClickFX:", e);
    }
    clickFxInstance = null;
  }
  dispose();
  window.removeEventListener("resize", updateFullScreenState);
});

onActivated(() => {
  //目前请不要让此component keepAlive, 可能导致未知的问题
  if (!firstMount) {
    continuePlay();
    prefixes.forEach(prefix => {
      player.value?.addEventListener(
        `${prefix}fullscreenchange`,
        handleFullScreenChange
      );
    });
  } else {
    firstMount = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleViewportResize);
  window.removeEventListener("orientationchange", handleViewportResize);
  eventBus.off("toggleScreenOrientation", toggleScreenOrientation);
  prefixes.forEach(prefix => {
    player.value?.removeEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
});

onDeactivated(() => {
  prefixes.forEach(prefix => {
    player.value?.removeEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
  stop();
});
</script>

<template>
  <div
    id="player"
    :style="{ height: `${playerHeight}px`, width: `${playerWidth}px` }"
    ref="player"
  >
    <div id="player__background" :style="playerStyle">
      <div id="player__main" :style="playerStyle">
        <div
          id="player__main__canvas"
          :style="{ transform: `scale(${pixiScale})` }"
        ></div>
        <BaUI
          :height="playerHeight"
          :width="playerWidth"
          :story-summary="storySummary"
          v-model:full-screen="fullScreen"
          :language="language"
          :voice-language="voiceLanguage"
        />
        <BaDialog
          :player-height="playerHeight"
          :player-width="playerWidth"
          :style="{ width: `${playerWidth}px` }"
        >
        </BaDialog>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

//noinspection CssOverwrittenProperties
html:has(#player:fullscreen), body:has(#player:fullscreen), html:has(#player.pseudo-fullscreen), body:has(#player.pseudo-fullscreen) {
  background: #000 !important;
  overflow: hidden !important;
}
#player {
  position: fixed;
  inset: 0;
  width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  margin: 0;
  border: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  background: #000 !important;

  &:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #000;
  }

  // 不知道为什么这个伪类只能分开写，合起来就不生效
  &:-webkit-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    box-sizing: border-box;
    background: #000 !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  // make mobile safari happy
  &.pseudo-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: none;
    transform-origin: center;
    z-index: 2147483001;
    background: #000;

    #player__main__canvas {
      z-index: 0;
    }
  }

  &__background {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
  }

  &__main {
    display: inline-block;
    flex: 0 0 auto;
    border: 0;
    position: relative;
    overflow: hidden;

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
<style lang="scss">
/* Screen Orientation API 不可用时，菜单按钮仍可切换播放器的横/竖向布局。 */
#player.manual-portrait-layout {
  width: 100dvh !important;
  height: 100vw !important;
  left: 50% !important;
  top: 50% !important;
  right: auto !important;
  bottom: auto !important;
  transform: translate(-50%, -50%) rotate(90deg) !important;
  transform-origin: center center !important;
}
#player.manual-landscape-layout {
  transform: none !important;
}

.pseudo-fullscreen {
  .text-container {
    animation: fuck-safari 999999s alternate infinite;
  }

  // iOS Safari version 18.3-：
  // 在 Canvas 上层的元素会触发 Composition engine bug，
  // 表现为元素不能正常显示，添加任意动画触发 repaint 即可显示
  // 但是添加动画后，元素会无法点击导致按钮无法使用
  // Safari 18.4 beta 已修复该问题，
  // 但是暂时想不到兼容方案，也没有更低版本的测试设备，就先这样吧
  .baui {
    visibility: visible !important;
  }
  // 给 Safari 一鞭子，让渲染引擎别睡死
  @keyframes fuck-safari {
    to {
      transform: translateX(1px);
    }
  }
}
.baui.has-menu + .text-container {
  z-index: 10;
}
</style>
