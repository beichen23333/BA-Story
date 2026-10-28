<script setup lang="ts">
import { ElButton, ElInputNumber, ElRadio, ElRadioGroup } from "element-plus";
import { inject, ref, watch, type Ref } from "vue";
import { getUiI18n } from "../../utils";
import { useUiState } from "@/stores/state";
import { Language } from "@/types/store";
import eventBus from "@/eventBus";

const language = inject<Ref<Language>>("language", ref("Cn" as Language));
const injectedVoiceLanguage = inject<Ref<string | undefined>>("voiceLanguage", ref("jp"));
const voiceLanguage = ref(injectedVoiceLanguage.value || "jp");
watch(injectedVoiceLanguage, (value) => {
  const next = value || "jp";
  if (voiceLanguage.value !== next) voiceLanguage.value = next;
});
watch(voiceLanguage, (value) => {
  const next = ["cn", "jp", "kr"].includes(value) ? value : "jp";
  try { localStorage.setItem("ba-story-voice-language", next); } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ba-story-voice-language-change", { detail: next }));
  }
});
defineOptions({
  name: "BaPlayerSettingPlaying",
});

type SpeedOption = 20 | 40 | 60 | "custom";
type WaitOption = 1000 | 1500 | 2500 | 3500;

const state = useUiState();
const reserveValue: SpeedOption[] = [20, 40, 60];
const typingSpeed = ref(state.playing.value.typingSpeed);
const selected = ref<SpeedOption>(
  reserveValue.includes(typingSpeed.value as SpeedOption)
    ? (typingSpeed.value as SpeedOption)
    : "custom"
);
const waitOptions: WaitOption[] = [1000, 1500, 2500, 3500];
const autoWaitTime = ref<WaitOption>(
  waitOptions.includes(state.playing.value.autoWaitTime as WaitOption)
    ? (state.playing.value.autoWaitTime as WaitOption)
    : 1500
);
if (!waitOptions.includes(state.playing.value.autoWaitTime as WaitOption)) {
  state.playing.value.autoWaitTime = 1500;
}
const customTips = getUiI18n(
  "playing-custom-setting-millisecond",
  language.value
).split("\n");
const selectedUiLanguage = ref(String(language.value || "Cn").toLowerCase());
watch(language, (value) => { selectedUiLanguage.value = String(value || "Cn").toLowerCase(); });
watch(selectedUiLanguage, (value) => {
  const next = ["cn", "en", "kr", "jp", "tw", "th"].includes(value) ? value : "cn";
  try { localStorage.setItem("ba-story-language", next); } catch {}
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ba-story-language-change", { detail: next }));
});

watch(
  () => selected.value,
  val => {
    if (val !== "custom") {
      typingSpeed.value = val;
    }
  }
);
watch(
  () => autoWaitTime.value,
  val => {
    state.playing.value.autoWaitTime = val;
  }
);
watch(
  () => typingSpeed.value,
  val => {
    state.playing.value.typingSpeed = val;
  }
);
</script>

<template>
  <div class="ba-setting-section">
    <div class="title">{{ getUiI18n("language-setting-title", language) }}</div>
    <div class="divider" />
    <p class="desc">{{ getUiI18n("language-setting-desc", language) }}</p>
    <ElRadioGroup v-model="selectedUiLanguage" class="options">
      <ElRadio value="cn">{{ getUiI18n("language-cn", language) }}</ElRadio>
      <ElRadio value="en">{{ getUiI18n("language-en", language) }}</ElRadio>
      <ElRadio value="kr">{{ getUiI18n("language-kr", language) }}</ElRadio>
      <ElRadio value="jp">{{ getUiI18n("language-jp", language) }}</ElRadio>
      <ElRadio value="tw">{{ getUiI18n("language-tw", language) }}</ElRadio>
      <ElRadio value="th">{{ getUiI18n("language-th", language) }}</ElRadio>
    </ElRadioGroup>
    <div class="divider" />
    <div class="title">{{ getUiI18n("voice-setting-title", language) }}</div>
    <div class="divider" />
    <p class="desc">{{ getUiI18n("voice-setting-desc", language) }}</p>
    <ElRadioGroup v-model="voiceLanguage" class="options">
      <ElRadio value="cn">{{ getUiI18n("voice-cn", language) }}</ElRadio>
      <ElRadio value="jp">{{ getUiI18n("voice-jp", language) }}</ElRadio>
      <ElRadio value="kr">{{ getUiI18n("voice-kr", language) }}</ElRadio>
    </ElRadioGroup>
    <div class="divider" />
    <div class="title">{{ getUiI18n("playing-speed", language) }}</div>
    <div class="divider" />
    <p class="desc">{{ getUiI18n("playing-speed-desc", language) }}</p>
    <ElRadioGroup v-model="selected" class="options">
      <ElRadio :value="60">{{
        getUiI18n("playing-speed-slow", language)
      }}</ElRadio>
      <ElRadio :value="40">{{
        getUiI18n("playing-speed-normal", language)
      }}</ElRadio>
      <ElRadio :value="20">{{
        getUiI18n("playing-speed-fast", language)
      }}</ElRadio>
      <ElRadio value="custom">{{
        getUiI18n("playing-custom-setting", language)
      }}</ElRadio>
    </ElRadioGroup>
    <div v-if="selected === 'custom'" class="custom-row">
      <span>{{ customTips[0] || "" }}</span>
      <ElInputNumber
        v-model="typingSpeed"
        class="custom-input"
        :max="500"
        :min="5"
        size="small"
      />
      <span>{{ customTips[1] || "" }}</span>
    </div>
    <div class="divider" />
    <div class="title">{{ getUiI18n("playing-auto-wait-title", language) }}</div>
    <div class="divider" />
    <p class="desc">{{ getUiI18n("playing-auto-wait-desc", language) }}</p>
    <ElRadioGroup v-model="autoWaitTime" class="options">
      <ElRadio :value="1000">{{ getUiI18n("playing-wait-fast", language) }}</ElRadio>
      <ElRadio :value="1500">{{ getUiI18n("playing-wait-normal", language) }}</ElRadio>
      <ElRadio :value="2500">{{ getUiI18n("playing-wait-slow", language) }}</ElRadio>
      <ElRadio :value="3500">{{ getUiI18n("playing-wait-slowest", language) }}</ElRadio>
    </ElRadioGroup>
    <div class="divider" />
    <div class="title">{{ getUiI18n("playing-replay-title", language) }}</div>
    <p class="desc">{{ getUiI18n("playing-replay-desc", language) }}</p>
    <ElButton size="small" type="primary" @click="eventBus.emit('replayStory')">
      {{ getUiI18n("playing-replay", language) }}
    </ElButton>
  </div>
</template>

<style scoped lang="scss">
$radio-size: 16px;

.ba-setting-section {
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 3px;
  background: white;
  padding: 14px 16px 16px;
  font-size: 14px;
}
.title {
  position: relative;
  margin: 0 0 0 8px;
  color: #2b3648;
  font-weight: bold;
  line-height: 20px;
  &::before {
    position: absolute;
    top: 2px;
    left: -8px;
    border-radius: 1.5px;
    background: #5ed2ff;
    width: 3px;
    height: 16px;
    content: "";
  }
}
.divider {
  margin: 10px 0;
  background-image: repeating-linear-gradient(
    to right,
    #c8c8c8 0,
    #c8c8c8 4px,
    transparent 4px,
    transparent 8px
  );
  height: 1px;
}
.desc {
  margin: 0 0 14px;
  color: #7a8799;
  font-size: 13px;
  line-height: 1.45;
}
.options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 20px;
  :deep(.el-radio) {
    margin-right: 0;
    height: auto;
    .el-radio__label {
      padding-left: 6px;
      color: #c0c4cc;
      font-size: 14px;
    }
    &.is-checked .el-radio__label {
      color: #2b3648;
    }
  }
  :deep(.el-radio__input .el-radio__inner) {
    border: 1px solid #c8c8c8;
    background: transparent;
    width: $radio-size;
    height: $radio-size;
    &::after {
      display: none;
    }
  }
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    border: none;
    box-shadow: none;
    background: url("/assets/slider_point.png") center / contain no-repeat;
    background-color: transparent;
  }
}
.custom-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: #4a5568;
  line-height: 24px;
}
.custom-input {
  width: 100px;
}
</style>
