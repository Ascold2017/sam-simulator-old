import type SAM from "@/classes/SAM";
import Sounds from "@/classes/Sounds";
import { defineStore } from "pinia";
import { inject } from "vue";

export const useSupplyPanelStore = defineStore("supply", {
  state: () => ({
    isEnabledPower: false,
    isEnabledRotation: false,
    isEnabledMainRadarTransmitter: false,
    isEnabledTargetRadarTransmitter: false,
    isEnabledThermalCamera: false,
  }),

  actions: {
    setEnabledPower(value: boolean) {
      if (value) {
        Sounds.startEngine();
        const i = setTimeout(() => {
          this.isEnabledPower = true;
          //@ts-ignore
          this.sam.setIsEnabled(true)
          clearTimeout(i);
        }, 3000);
      } else {
        Sounds.stopEngine();
        this.isEnabledPower = false;
        this.isEnabledRotation = false;
        this.isEnabledMainRadarTransmitter = false;
        this.isEnabledTargetRadarTransmitter = false;
        this.isEnabledThermalCamera = false;
        //@ts-ignore
        sam.setIsEnabled(false)
      }
    },
    setEnablerRotation(value: boolean) {
      if (!this.isEnabledPower) return;
      if (value) {
        const i = setTimeout(() => {
          this.isEnabledRotation = true;
          clearTimeout(i);
        }, 1000);
      } else {
        this.isEnabledRotation = false;
      }
    },
    setIsEnabledMainRadarTransmitter(value: boolean) {
      if (!this.isEnabledPower || !this.isEnabledRotation) return;
      if (value) {
        const i = setTimeout(() => {
          this.isEnabledMainRadarTransmitter = true;
          clearTimeout(i);
        }, 500);
      } else {
        this.isEnabledMainRadarTransmitter = false;
      }
    },
    setIsEnabledTargetRadarTransmitter(value: boolean) {
      if (!this.isEnabledPower) return;
      if (value) {
        const i = setTimeout(() => {
          this.isEnabledTargetRadarTransmitter = true;
          clearTimeout(i);
        }, 500);
      } else {
        this.isEnabledTargetRadarTransmitter = false;
      }
    },
    setIsEnabledThermalCamera(value: boolean) {
      if (!this.isEnabledPower) return;
      if (value) {
        const i = setTimeout(() => {
          this.isEnabledThermalCamera = true;
          clearTimeout(i);
        }, 500);
      } else {
        this.isEnabledThermalCamera = false;
      }
    }
  },
});
