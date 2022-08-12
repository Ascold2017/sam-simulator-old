import { SAM_PARAMS, type IRecognizedTargets } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useTargetRadarStore } from "./targetRadar";

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as IRecognizedTargets[],
  }),
  getters: {
    targetsInRay() {
      const targetRadar = useTargetRadarStore();
      this.targets.filter(target => {
        const intoAzimut = Math.abs(target.azimut - targetRadar.targetCursorAngle) < SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY;
        const intoElevation = Math.abs(target.elevation - targetRadar.targetCursorElevation) < SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY;
        return intoAzimut && intoElevation
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
