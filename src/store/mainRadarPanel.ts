import { SAM_PARAMS } from "@/classes/SAM";
import { defineStore } from "pinia";

export enum ViewModes {
  MainRadar = "MainRadar",
  TargetRadar = 'TargetRadar',
  BIP = "BIP",
  LOGS = "LOGS",
}
export const useMainRadarStore = defineStore("mainRadar", {
  state: () => ({
    viewMode: ViewModes.MainRadar,
    maxDisplayedDistance: 120,
    
    radarRotation: 1.5 * Math.PI,
    rotationInterval: null as number | null,
  }),
  getters: {
    scale(): number {
      return (SAM_PARAMS.MAX_DISTANCE / this.maxDisplayedDistance) * 2.6;
    },
  },
  actions: {
    setDefaultValues() {
      this.viewMode = ViewModes.MainRadar;
      this.maxDisplayedDistance = 120;
      this.rotationInterval && clearInterval(this.rotationInterval);
      this.radarRotation = 1.5 * Math.PI;
    },
    setViewMode(value: ViewModes) {
      this.viewMode = value;
    },
    setMaxDisplayedDistance(value: number) {
      this.maxDisplayedDistance = value;
    },
    
    turnRotationMainRadar(value: boolean) {
      if (value) {
        this.rotationInterval = setInterval(() => {
          const dR = Math.PI / 180;
          this.radarRotation = this.radarRotation + dR >= 2 * Math.PI
            ? dR
            : this.radarRotation + dR;
        });
      } else {
        this.rotationInterval && clearInterval(this.rotationInterval);
        this.radarRotation = 1.5 * Math.PI;
      }
    },
  },
});
