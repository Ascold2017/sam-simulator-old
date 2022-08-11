import type { IRecognizedTargets } from "@/classes/SAM";
import { defineStore } from "pinia";

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    targets: [] as IRecognizedTargets[],
  }),
  actions: {
    setTargets(targets: IRecognizedTargets[]) {
      this.targets = targets;
    },
  },
});
