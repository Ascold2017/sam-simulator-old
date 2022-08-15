import { type IRecognizedTargets, SAM_PARAMS } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useMainRadarStore, ViewModes } from "./mainRadarPanel";
import { useSupplyPanelStore } from "./supplyPanel";
import { useWeaponPanelStore } from "./weaponPanel";

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

  getters: {
    isCapturedAll(): boolean {
      return this.isCapturedAzimut && this.isCapturedElevation &&
        this.isCapturedDistance;
    },
    distanceToHit(): number {
      const weaponPanelStore = useWeaponPanelStore();
      if (
        !this.isCapturedAll || !this.capturedTarget ||
        !weaponPanelStore.currentMissile
      ) {
        return 0;
      }
      const timeToHitKmS = this.capturedTarget.distance /
        ((this.capturedTarget.radialVelocity +
          weaponPanelStore.currentMissile.velocity) / 1000);
      return (timeToHitKmS * (weaponPanelStore.currentMissile.velocity / 1000));
    },
  },

  actions: {
    setDefaultValues() {
      this.resetCaptureAll();
      this.targetCursorAngle = 1.5 * Math.PI;
      this.targetCursorDistance = 30;
      this.targetCursorElevation = 0;
    },
    incrementTargetCursorAzimut(value: number) {
      if (this.isCapturedAzimut) return;
      value *= Math.PI / 180;
      let newAngle = this.targetCursorAngle + value < 0
        ? 2 * Math.PI + value
        : this.targetCursorAngle + value;
      newAngle = newAngle >= 2 * Math.PI ? value : newAngle;
      this.targetCursorAngle = newAngle;
    },
    incrementTargetCursorElevation(value: number) {
      if (this.isCapturedElevation) return;
      this.targetCursorElevation = this.targetCursorElevation +
        value * Math.PI / 180;
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
      const mainRadarStore = useMainRadarStore();
      if (!supply.isEnabledTargetRadarTransmitter) return;

      if (this.isCapturedAzimut) {
        this.isCapturedAzimut = false;
        mainRadarStore.viewMode = ViewModes.MainRadar;
        return;
      }
      // @ts-ignore
      this.capturedTargetId = this.sam.getTargetOnAzimutAndDistanceWindow(
        this.targetCursorAngle,
        this.targetCursorDistance,
      );
      this.isCapturedAzimut = !!this.capturedTargetId;
    },

    captureByElevation() {
      const supply = useSupplyPanelStore();
      const mainRadarPanel = useMainRadarStore();
      if (!supply.isEnabledTargetRadarTransmitter) return;

      if (this.isCapturedElevation) {
        this.isCapturedElevation = false;
        return;
      }

      // @ts-ignore
      const capturedTargetId = this.sam.getTargetOnAzimutAndElevation(
        this.targetCursorAngle,
        this.targetCursorElevation,
      );
      this.isCapturedElevation = !!capturedTargetId;
      capturedTargetId && (this.capturedTargetId = capturedTargetId);
      if (this.isCapturedAll) {
        mainRadarPanel.setViewMode(ViewModes.MainRadar);
      }
    },

    captureByDistance() {
      const supply = useSupplyPanelStore();
      const mainRadarPanel = useMainRadarStore();
      if (!supply.isEnabledTargetRadarTransmitter) {
        return;
      }
      if (this.isCapturedDistance) {
        this.isCapturedDistance = false;
        return;
      }
      // @ts-ignore
      const capturedTargetId = this.sam.getTargetOnAzimutElevationAndDistance(
        this.targetCursorAngle,
        this.targetCursorElevation,
        this.targetCursorDistance,
      );

      this.isCapturedDistance = !!capturedTargetId;
      capturedTargetId && (this.capturedTargetId = capturedTargetId);

      if (this.isCapturedAll) {
        mainRadarPanel.setViewMode(ViewModes.MainRadar);
      }
    },

    resetCaptureAll() {
      const mainRadarStore = useMainRadarStore();
      this.isCapturedAzimut = false;
      this.isCapturedDistance = false;
      this.isCapturedElevation = false;
      this.capturedTargetId = null;
      mainRadarStore.viewMode = ViewModes.MainRadar;
    },

    resetCaptureDistance() {
      this.isCapturedDistance = false;
    },
    resetCaptureTarget(id: string) {
      if (this.capturedTargetId === id) this.resetCaptureAll();
    },
  },
});
