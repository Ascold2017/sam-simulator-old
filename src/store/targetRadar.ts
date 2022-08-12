import { type IRecognizedTargets, SAM_PARAMS } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useMainRadarStore } from "./mainRadarPanel";
import { useSupplyPanelStore } from "./supplyPanel";

export const useTargetRadarStore = defineStore("targetRadar", {
  state: () => ({
    capturedTargetId: null as null | string,
    isCapturedAzimut: false,
    isCapturedDistance: false,
    isCapturedElevation: false,
    capturedTarget: null as IRecognizedTargets | null,
    targetCursorAngle: 1.5 * Math.PI,
    targetCursorDistance: 30,
    targetCursorElevation: 0,
  }),

  actions: {
    incrementTargetCursorAngle(value: number) {
      if (this.isCapturedAzimut) return;
      value *= Math.PI / 180;
      let newAngle = this.targetCursorAngle + value < 0
        ? 2 * Math.PI + value
        : this.targetCursorAngle + value;
      newAngle = newAngle >= 2 * Math.PI ? value : newAngle;
      this.targetCursorAngle = newAngle;
    },
    incrementTargetCursorDistance(value: number) {
      const mainRadarStore = useMainRadarStore();
      if (
        this.targetCursorDistance + value < SAM_PARAMS.MIN_CAPTURE_RANGE ||
        this.targetCursorDistance + value >=
          mainRadarStore.maxDisplayedDistance ||
        this.isCapturedDistance
      ) {
        return;
      }
      this.targetCursorDistance += value;
    },
    captureByAzimut() {
      const supply = useSupplyPanelStore();
      if (!supply.isEnabledTargetRadarTransmitter) return;
      // @ts-ignore
      this.capturedTargetId = this.sam.getTargetOnAzimutAndDistanceWindow(
        this.targetCursorAngle,
        this.targetCursorDistance,
      );
      this.isCapturedAzimut = !!this.capturedTargetId;
    },

    captureByElevation() {
      const supply = useSupplyPanelStore();
      if (!supply.isEnabledTargetRadarTransmitter) return;
    },

    captureByDistance() {
      const supply = useSupplyPanelStore();
      if (!supply.isEnabledTargetRadarTransmitter || this.isCapturedDistance) {
        return;
      }
      // @ts-ignore
      this.isCapturedDistance = !!this.sam.isTargetOnDistance(
        this.capturedTargetId,
        this.targetCursorDistance,
      );
    },

    resetCaptureAll() {
      this.isCapturedAzimut = false;
      this.isCapturedDistance = false;
      this.isCapturedElevation = false;
      this.capturedTargetId = null;
    },

    resetCaptureDistance() {
      this.isCapturedDistance = false;
    },
    resetCaptureTarget(id: string) {
      if (this.capturedTargetId === id) this.resetCaptureAll();
    },
  },
});
