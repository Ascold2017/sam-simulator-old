import type {
  IFlightMissile,
  IRecognizedFlightObject,
} from "@/SAM/SAM";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import { defineStore } from "pinia";
import { useTargetRadarStore } from "./targetRadar";

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as IRecognizedFlightObject[],
    missiles: [] as IFlightMissile[],
  }),
  getters: {
    targetsInRay(): IRecognizedFlightObject[] {
      const targetRadar = useTargetRadarStore();
      return this.targets.filter((target) => {
        const intoAzimut =
          Math.abs(target.azimuth - targetRadar.targetCursorAngle) <
            SAM_PARAMS.TARGET_RADAR_RAY_WIDTH / 2;
        const intoElevation =
          Math.abs(target.elevation - targetRadar.targetCursorElevation) <
            SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT / 2;
        return intoAzimut && intoElevation;
      });
    },
  },
  actions: {
    setTargets(targets: IRecognizedFlightObject[], missiles: IFlightMissile[]) {
      const targetRadar = useTargetRadarStore();
      this.targets = targets;
      this.missiles = missiles;
      targetRadar.capturedTarget = targets.find((t) =>
        t.identifier === targetRadar.capturedTargetId
      ) || null;
      if (targetRadar.isCapturedDirection && targetRadar.capturedTarget) {
        targetRadar.targetCursorAngle = targetRadar.capturedTarget.azimuth;
        targetRadar.targetCursorElevation =
          targetRadar.capturedTarget.elevation;
      }
      if (targetRadar.isCapturedDistance && targetRadar.capturedTarget) {
        targetRadar.targetCursorDistance = targetRadar.capturedTarget.distance;
      }
    },
  },
});
