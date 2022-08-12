import { SAM_PARAMS, type IRecognizedTargets } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useTargetRadarStore } from "./targetRadar";

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as IRecognizedTargets[],
  }),
  getters: {
    targetsInRay(): IRecognizedTargets[] {
      const targetRadar = useTargetRadarStore();
      return this.targets.filter(target => {
        const intoAzimut = Math.abs(target.azimut - targetRadar.targetCursorAngle) < SAM_PARAMS.TARGET_RADAR_RAY_WIDTH/2;
        const intoElevation = Math.abs(target.elevation - targetRadar.targetCursorElevation) < SAM_PARAMS.TARGET_RADAR_RAY_WIDTH/2;
        const intoDistanceWindow = Math.abs(target.distance - targetRadar.targetCursorDistance) < SAM_PARAMS.RADAR_DISTANCE_WINDOW/2
        return intoAzimut && intoElevation && intoDistanceWindow
      })
    }
  },
  actions: {
    setTargets(targets: IRecognizedTargets[]) {
      const targetRadar = useTargetRadarStore();
      this.targets = targets;
      targetRadar.capturedTarget = targets.find((t) =>
        t.identifier === targetRadar.capturedTargetId
      ) || null;
      if (targetRadar.isCapturedAzimut && targetRadar.capturedTarget) {
        targetRadar.targetCursorAngle = targetRadar.capturedTarget.azimut;
      }
      if (targetRadar.isCapturedDistance && targetRadar.capturedTarget) {
        targetRadar.targetCursorDistance = targetRadar.capturedTarget.distance;
      }
      if (targetRadar.isCapturedElevation && targetRadar.capturedTarget) {
        targetRadar.targetCursorElevation = targetRadar.capturedTarget.elevation;
      }
    },
  },
});
