<script setup lang="ts">
import { inject, ref, type Ref } from "vue";
import { getUiI18n } from "../../utils";
import { Language } from "@/types/store";

const language = inject<Ref<Language>>("language", ref("Cn" as Language));
defineOptions({
  name: "BaPlayerSettingAbout",
});
</script>

<template>
  <div>
    <p v-html="getUiI18n('about-inside', language)"></p>
  </div>
</template>

<style scoped lang="scss">
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  p {
    text-align: center;
  }
}
</style>
