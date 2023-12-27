import Sounds from "@/core/Sounds";
import { defineStore } from "pinia";


export const useMainStore = defineStore('mainStore', {
  state: () => ({
    isEnabled: false
  }),
  actions: {
    setIsEnabled(value: boolean) {
      if (value) {
        Sounds.startEngine();
        const i = setTimeout(() => {
          //@ts-ignore
          this.sam.setIsEnabled(true);
          this.isEnabled = true;
          clearTimeout(i);
        }, 3000);
      } else {
        Sounds.stopEngine();
        this.isEnabled = false;
        //@ts-ignore
        this.sam.setIsEnabled(false);
      }
    }
  }
})