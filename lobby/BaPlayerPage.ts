import { computed, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import BaStoryPlayer from "../player-lib/BaStoryPlayer.vue";
import { RESOURCE_ROOT, getScenarioScriptUrl } from "../public/utils.ts";
import type { TranslatedStoryUnit } from "../player-lib/types/common";
import type { Language, StorySummary } from "../player-lib/types/store";
const DEFAULT_DATA_URL = RESOURCE_ROOT;
const LANGUAGE_OPTIONS: Array<{
    value: Language;
    label: string
}> = [
    {
        value: "Cn",
        label: "简体中文"
    },
    {
        value: "Tw",
        label: "繁體中文"
    },
    {
        value: "Jp",
        label: "日本語"
    },
    {
        value: "En",
        label: "English"
    },
];
const selectStyle = "padding:5px 8px;border:1px solid #2c3341;border-radius:6px;background:#0f1116;" + "color:#e6e8ee;font-size:13px;outline:none;";
const hintStyle = "padding:80px 20px;color:#7f8899;font-size:14px;";
export function createBaPlayerPage() {
    return defineComponent(
        {
            name: "BaPlayerPage",
            setup() {
                /* ---------- 剧情数据 ---------- */
                const story = ref<TranslatedStoryUnit | null>();
                const loading = ref(true);
                const loadError = ref("");
                async function loadStory() {
                    loading.value = true;
                    loadError.value = "";
                    const storyParam = new URLSearchParams(location.search).get("story");
                    try {
                        if (storyParam) {
                            const res = await fetch(storyParam);
                            if (!res.ok)
                                throw new Error(`HTTP ${res.status}`);
                            story.value = (await res.json())as TranslatedStoryUnit;
                        } else {
                            const url = getScenarioScriptUrl(1101);
                            const res = await fetch(url, { cache: "no-store" });
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            story.value = (await res.json()) as TranslatedStoryUnit;
                        }
                    } catch (e) {
                        loadError.value = `剧情加载失败：${(e as Error).message}`;
                        story.value = null;
                    } finally {
                        loading.value = false;
                    }
                }
                /* ---------- 配置 ---------- */
                const language = ref<Language>("Cn");
                const storedVoiceLanguage = localStorage.getItem("ba-story-voice-language") || "jp";
                const voiceLanguage = ref(["cn", "jp", "kr"].includes(storedVoiceLanguage) ? storedVoiceLanguage : "jp");
                const useSuperSampling = ref(false);
                const startFullScreen = ref(false);
                const useMp3 = ref(false);
                const userName = ref("sensei");
                const dataUrl = ref(DEFAULT_DATA_URL);
                const playerWidth = ref(1000);
                const playerHeight = ref(562.5);
                const storySummary = computed<StorySummary>(() => ({
                    chapterName: "优香 · 晨跑",
                    summary: "清晨散步时，[USERNAME]老师偶然遇到了正在晨跑的优香。以此为契机，两人开始了一段跑步的经历。",
                }));
                const status = ref("待开始");
                const onInitiated = () => (status.value = "播放中");
                const onEnd = () => (status.value = "已播放完毕");
                const onError = () => (status.value = "发生错误（资源加载或播放失败）");
                /* ---------- 自适应尺寸 ---------- */
                function fitToViewport() {
                    const w = Math.max(320,
                    Math.min(window.innerWidth - 40, 1280));
                    playerWidth.value = w;
                    playerHeight.value = Math.round((w * 9) / 16);
                }
                onMounted(() => {
                    fitToViewport();
                    window.addEventListener("resize", fitToViewport);
                    loadStory();
                });
                onUnmounted(() => window.removeEventListener("resize",
                fitToViewport));
                /* ---------- 渲染 ---------- */
                const labelStyle = "display:inline-flex;align-items:center;gap:6px;color:#b8c0d2;";
                return() => {
                    const controls = h(
                        "div",
                        {
                            style: "display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;padding:10px 14px;" + "border:1px solid #262b36;border-radius:10px;background:#171a21;font-size:13px;",
                        },
                        [
                            h(
                                "label",
                                {
                                    style: labelStyle
                                },
                                [
                                    "语言",
                                    h(
                                        "select",
                                        {
                                            value: language.value,
                                            onChange: (e: Event) => (language.value = (e.target as HTMLSelectElement).value as Language),
                                            style: selectStyle,
                                        },
                                        LANGUAGE_OPTIONS.map(o => h("option", {
                                            value: o.value
                                        }, o.label))
                                    ),
                                ]
                            ),
                            h(
                                "label",
                                {
                                    style: labelStyle
                                },
                                [
                                    h(
                                        "input",
                                        {
                                            type: "checkbox",
                                            checked: useSuperSampling.value,
                                            onChange: (e: Event) => (useSuperSampling.value = (e.target as HTMLInputElement).checked),
                                        }
                                    ),
                                    "2 倍超分",
                                ]
                            ),
                            h(
                                "label",
                                {
                                    style: labelStyle
                                },
                                [
                                    h(
                                        "input",
                                        {
                                            type: "checkbox",
                                            checked: useMp3.value,
                                            onChange: (e: Event) => (useMp3.value = (e.target as HTMLInputElement).checked),
                                        }
                                    ),
                                    "MP3（Safari 兼容）",
                                ]
                            ),
                            h(
                                "label",
                                {
                                    style: labelStyle
                                },
                                [
                                    h(
                                        "input",
                                        {
                                            type: "checkbox",
                                            checked: startFullScreen.value,
                                            onChange: (e: Event) => (startFullScreen.value = (e.target as HTMLInputElement).checked),
                                        }
                                    ),
                                    "立即全屏",
                                ]
                            ),
                            h(
                                "label",
                                {
                                    style: `${labelStyle}flex:1 1 260px;`
                                },
                                [
                                    "资源服务器",
                                    h(
                                        "input",
                                        {
                                            type: "text",
                                            value: dataUrl.value,
                                            spellcheck: false,
                                            onInput: (e: Event) => (dataUrl.value = (e.target as HTMLInputElement).value),
                                            style: "flex:1;min-width:0;padding:5px 8px;border:1px solid #2c3341;border-radius:6px;" + "background:#0f1116;color:#e6e8ee;font-size:13px;outline:none;",
                                        }
                                    ),
                                ]
                            ),
                            h(
                                "button",
                                {
                                    onClick: () => loadStory(),
                                    style: "padding:6px 14px;border:1px solid #3a63c9;border-radius:6px;" + "background:#2a4a9c;color:#fff;font-size:13px;cursor:pointer;",
                                },
                                "重新加载"
                            ),
                            h("span",
                            {
                                style: "margin-left:auto;color:#7f8899;font-size:12px;"
                            },
                            [`状态：${status.value}`,]),
                        ]
                    );
                    let stageChild;
                    if (loading.value) {
                        stageChild = h("div",
                        {
                            style: hintStyle
                        },
                        "正在加载剧情数据…");
                    } else
                        if (loadError.value) {
                            stageChild = h("div",
                            {
                                style: `${hintStyle}color:#e26a6a;`
                            },
                            loadError.value);
                        } else
                            if (story.value) {
                                stageChild = h(
                                    BaStoryPlayer as never,
                                    {
                                        key: `${language.value}-${useSuperSampling.value}-${useMp3.value}`, story: story.value, dataUrl: dataUrl.value, width: playerWidth.value, height: playerHeight.value, language: language.value, voiceLanguage: voiceLanguage.value, userName: userName.value, storySummary: storySummary.value, startFullScreen: startFullScreen.value, useMp3: useMp3.value, useSuperSampling: useSuperSampling.value ? "2" : false, onInitiated, onEnd, onError,
                                    }
                                );
                            }
                    return h(
                        "div",
                        {
                            style: "display:flex;flex-direction:column;gap:12px;box-sizing:border-box;min-height:100vh;" + "padding:16px 20px 24px;background:#111318;color:#e6e8ee;" + 'font-family:"PingFang SC","Microsoft YaHei",Arial,system-ui,sans-serif;',
                        },
                        [
                            h(
                                "header",
                                {},
                                [
                                    h("h1",
                                    {
                                        style: "margin:0;font-size:20px;font-weight:600;letter-spacing:.5px;"
                                    },
                                    "碧蓝档案 · 剧情播放器"),
                                    h(
                                        "p",
                                        {
                                            style: "margin:4px 0 0;color:#8b93a7;font-size:12px;word-break:break-all;"
                                        },
                                        `ba-story-player 演示页面 · 数据源：${dataUrl.value}`
                                    ),
                                ]
                            ),
                            controls,
                            h("main",
                            {
                                style: "display:flex;flex:1;justify-content:center;align-items:flex-start;"
                            },
                            [stageChild]),
                            h(
                                "footer",
                                {
                                    style: "color:#6b7385;font-size:12px;text-align:center;"
                                },
                                "操作：点击 / 空格 推进对话 · 右上角可全屏 · 左上角菜单可查看历史记录"
                            ),
                        ]
                    );
                };
            },
        }
    );
}