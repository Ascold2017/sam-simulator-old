import { SAM_PARAMS } from "@/classes/SAM";
import { defineStore } from "pinia";

export enum ViewModes {
  MainRadar = "MainRadar",
  BIP = "BIP",
  LOGS = "LOGS",
}
export const useMainRadarStore = defineStore("mainRadar", {
  state: () => ({
    viewMode: ViewModes.MainRadar,
    maxDisplayedDistance: 80,
    targetCursorAngle: 1.5 * Math.PI,
    targetCursorDistance: 30,
    distanceWindowLength: 2, // 2 km
    radarRotation: 1.5 * Math.PI,
    rotationInterval: null as number | null,
  }),
  getters: {
    scale(): number {
      return (SAM_PARAMS.MAX_DISTANCE / this.maxDisplayedDistance) * 2.8;
    },
  },
  actions: {
    setViewMode(value: ViewModes) {
      this.viewMode = value;
    },
    setMaxDisplayedDistance(value: number) {
      this.maxDisplayedDistance = value;
    },
    incrementTargetCursorAngle(value: number) {
      value *= Math.PI / 180;
      let newAngle = this.targetCursorAngle + value < 0
        ? 2 * Math.PI + value
        : this.targetCursorAngle + value;
      newAngle = newAngle >= 2 * Math.PI ? value : newAngle;
      this.targetCursorAngle = newAngle;
    },
    incrementTargetCursorDistance(value: number) {
      if (
        this.targetCursorDistance + value < SAM_PARAMS.MIN_CAPTURE_RANGE ||
        this.targetCursorDistance + value >= this.maxDisplayedDistance
      ) {
        return;
      }
      this.targetCursorDistance += value;
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
