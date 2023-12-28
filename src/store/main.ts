import DetectedRadarObject from "@/core/SAM/RadarObject/DetectedRadarObject";
import Sounds from "@/core/Sounds";
import { defineStore } from "pinia";


export const useMainStore = defineStore('mainStore', {
  state: () => ({
    isEnabled: false,
    currentTargetIndex: 0
  }),
  actions: {
    setIsEnabled(value: boolean) {
      if (value) {
        Sounds.startEngine();
        const i = setTimeout(() => {
          //@ts-ignore
          this.sam.setIsEnabled(true);
          this.isEnabled = true;
          clearTimeout(i);
        }, 3000);
      } else {
        Sounds.stopEngine();
        this.isEnabled = false;
        //@ts-ignore
        this.sam.setIsEnabled(false);
      }
    },
    seekTarget() {
      this.currentTargetIndex++;
      // @ts-ignore
      if (this.currentTargetIndex >= this.sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject && !fo.isMissile).length) {
        this.currentTargetIndex = 0;
      }
    },
    resetCurrentTarget() {
      this.currentTargetIndex = 0;
    }
  }
})