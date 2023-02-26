import { defineStore } from "pinia";

export enum ViewModes {
  MainRadar = "MainRadar",
  TargetRadar = 'TargetRadar',
  LOGS = "LOGS",
}
export const useMainRadarStore = defineStore("mainRadar", {
  state: () => ({
    viewMode: ViewModes.TargetRadar,

  }),
  getters: {
    scale(): number {
      return 2.6;
    },
  },
  actions: {
    setDefaultValues() {
      this.viewMode = ViewModes.MainRadar;
      
    },
    setViewMode(value: ViewModes) {
      this.viewMode = value;
    },
  },
});
