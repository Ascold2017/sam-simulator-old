import { defineStore } from "pinia";

export enum CaptureModes {
  Manual = "Manual",
  Radio = "Radio",
  Optical = "Optical",
  Jamming = "Jamming",
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
