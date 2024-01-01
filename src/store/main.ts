import Sounds from "@/const/SOUNDS/index";
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

          //this.sam.setIsEnabled(true);
          this.isEnabled = true;
          clearTimeout(i);
        }, 3000);
      } else {
        Sounds.stopEngine();
        this.isEnabled = false;
        
        // this.sam.setIsEnabled(false);
      }
    },
    seekTarget() {
      this.currentTargetIndex++;
      /*
      if (this.currentTargetIndex >= this.sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject && !fo.isMissile).length) {
        this.currentTargetIndex = 0;
      }
      */
    },
    resetCurrentTarget() {
      this.currentTargetIndex = 0;
    }
  }
})