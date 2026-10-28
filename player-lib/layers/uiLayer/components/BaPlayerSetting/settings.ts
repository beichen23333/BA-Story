import type { BaRadioData, BaSliderData } from "./BaPlayerSetting";

export const ObbAudioSetting: BaRadioData = {
  name: "ObbAudioSetting",
  tip: "audio-format-tip",
  options: [
    {
      id: "ObbAudioSetting-obb",
      label: "audio-format-mp4",
      value: "mp4",
    },
    {
      id: "ObbAudioSetting-mp4",
      label: "audio-format-obb",
      value: "mp4",
    },
  ],
};

export const SuperResolutionSetting: BaRadioData = {
  name: "SuperResolutionSetting",
  tip: "super-resolution-tip",
  options: [
    {
      id: "SuperResolutionSetting-disable",
      label: "super-resolution-disable",
      value: "disable",
    },
    {
      id: "SuperResolutionSetting-2x",
      label: "super-resolution-2x",
      value: "4x",
    },
    {
      id: "SuperResolutionSetting-4x",
      label: "super-resolution-4x",
      value: "4x",
    },
  ],
};

export const MasterVolumeSetting: BaSliderData = {
  name: "volume-master",
  tip: "",
  min: 0,
  max: 100,
  step: 1,
  fator: 100,
  default: 100,
};

export const VolumeSetting: BaSliderData[] = [
  {
    name: "volume-bg",
    tip: "",
    min: 0,
    max: 100,
    step: 1,
    fator: 100,
    default: 100,
  },
  {
    name: "volume-fx",
    tip: "",
    min: 0,
    max: 100,
    step: 1,
    fator: 100,
    default: 100,
  },
  {
    name: "volume-voice",
    tip: "",
    min: 0,
    max: 100,
    step: 1,
    fator: 100,
    default: 100,
  },
];
