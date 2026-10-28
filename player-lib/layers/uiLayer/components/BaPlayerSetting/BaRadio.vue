<script setup lang="ts">
import { inject, ref, type Ref } from "vue";
import { getUiI18n } from "../../utils";
import type { Language } from "@/types/store";
import { BaRadioData } from "./BaPlayerSetting";

const props = defineProps<{
  data: BaRadioData;
}>();
const language = inject<Ref<Language>>("language", ref("Cn" as Language));
</script>

<template>
  <div class="ba-radio">
    <div>
      {{ getUiI18n(data.tip, language) }}
    </div>
    <template
      v-for="(option, index) in props.data.options"
      :key="option.id + index"
    >
      <input
        type="radio"
        :name="props.data.name"
        :value="option.value"
        :id="option.id"
      />
      <label :for="option.id">{{ getUiI18n(option.label, language) }}</label>
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
