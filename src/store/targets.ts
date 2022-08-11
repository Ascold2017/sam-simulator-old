import type { IRecognizedTargets } from "@/classes/SAM";
import { defineStore } from "pinia";
import { useTargetRadarStore } from "./targetRadar";

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as IRecognizedTargets[],
  }),
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
    },
  },
});
