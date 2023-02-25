import {
  type IFlightMissiles,
  type IRecognizedTargets,
} from "@/core/SAM";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import { defineStore } from "pinia";
import { useMainRadarStore } from "./mainRadarPanel";
import { useTargetRadarStore } from "./targetRadar";
import { MissileStates, useWeaponPanelStore } from "./weaponPanel";

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as IRecognizedTargets[],
    missiles: [] as IFlightMissiles[],
  }),
  getters: {
    targetsInRay(): IRecognizedTargets[] {
      const targetRadar = useTargetRadarStore();
      return this.targets.filter((target) => {
        const intoAzimut =
          Math.abs(target.azimut - targetRadar.targetCursorAngle) <
            SAM_PARAMS.TARGET_RADAR_RAY_WIDTH / 2;
        const intoElevation =
          Math.abs(target.elevation - targetRadar.targetCursorElevation) <
            SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT / 2;
        return intoAzimut && intoElevation;
      });
    },
  },
  actions: {
    setTargets(targets: IRecognizedTargets[], missiles: IFlightMissiles[]) {
      const targetRadar = useTargetRadarStore();
      this.targets = targets;
      this.missiles = missiles;
      targetRadar.capturedTarget = targets.find((t) =>
        t.identifier === targetRadar.capturedTargetId
      ) || null;
      if (targetRadar.isCapturedDirection && targetRadar.capturedTarget) {
        targetRadar.targetCursorAngle = targetRadar.capturedTarget.azimut;
        targetRadar.targetCursorElevation =
          targetRadar.capturedTarget.elevation;
      }
      if (targetRadar.isCapturedDistance && targetRadar.capturedTarget) {
        targetRadar.targetCursorDistance = targetRadar.capturedTarget.distance;
      }
    },
  },
});
