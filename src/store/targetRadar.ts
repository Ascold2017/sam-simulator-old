import type { IRecognizedTargets } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useMainRadarStore } from "./mainRadarPanel";
import { useSupplyPanelStore } from "./supplyPanel";
import { useTargetsStore } from "./targets";

export const useTargetRadarStore = defineStore("targetRadar", {
  state: () => ({
    capturedTargetId: null as null | string,
    isCapturedAzimut: false,
    isCapturedDistance: false,
    isCapturedElevation: false,
  }),
  getters: {
    capturedTarget(): IRecognizedTargets | null {
      const targetsStore = useTargetsStore();
      if (!this.capturedTargetId) return null;
      return targetsStore.targets.find((t) =>
        t.identifier === this.capturedTargetId
      ) || null;
    },
  },

  actions: {
    captureByAzimut() {
      const supply = useSupplyPanelStore();
      const mainRadar = useMainRadarStore();
      if (!supply.isEnabledTargetRadarTransmitter) return;
      // @ts-ignore
      this.capturedTargetId = this.sam.getTargetOnAzimutAndDistanceWindow(
        mainRadar.targetCursorAngle,
        mainRadar.targetCursorDistance,
      );
      this.isCapturedAzimut = !!this.capturedTargetId;
    },
    resetCaptureAll() {
      this.isCapturedAzimut = false;
      this.isCapturedDistance = false;
      this.isCapturedElevation = false;
      this.capturedTargetId = null;
    },
    resetCaptureTarget(id: string) {
      if (this.capturedTargetId === id) this.resetCaptureAll();
    }
  },
});
