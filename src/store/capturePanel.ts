import { defineStore } from "pinia";

export enum CaptureModes {
  Manual = "Manual",
  Designation = "Designation",
  Optical = "Optical"
}
export const useCapturePanelStore = defineStore("capturePanel", {
  state: () => ({
    captureMode: CaptureModes.Manual,
  }),
  actions: {
    setDefaultValues() {
      this.captureMode = CaptureModes.Manual
    },
    setCaptureMode(mode: CaptureModes) {
      this.captureMode = mode;
    },
  },
});
