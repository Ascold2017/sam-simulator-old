import { defineStore } from "pinia";
import { useSupplyPanelStore } from "@/store/supplyPanel";
import { useTargetRadarStore } from "./targetRadar";
export enum MissileStates {
  READY = "READY",
  IN_RANGE = "IN_RANGE",
  LAUNCH = "LAUNCH",
  RESET = "RESET",
}

interface IMissile {
  id: number;
  isLaunched: boolean;
  isDestroyed: boolean;
  velocity: number;
  maxDistance: number;
}
export const useWeaponPanelStore = defineStore("weaponPanel", {
  state: () => ({
    missiles: Array(8).fill(0).map((_, i) => ({
      id: i + 1,
      isLaunched: false,
      isDestroyed: false,
      velocity: 1200,
      maxDistance: 50,
    })) as IMissile[],
    currentMissileId: null as number | null,
    isMissileReady: false,
  }),

  getters: {
    currentMissile(): IMissile | null {
      return this.missiles.find((m) => m.id === this.currentMissileId) || null;
    },
  },

  actions: {
    setDefaultValues() {
      this.missiles = Array(8).fill(0).map((_, i) => ({
        id: i + 1,
        isLaunched: false,
        isDestroyed: false,
        velocity: 1200,
        maxDistance: 50,
      }));
      this.currentMissileId = null;
      this.isMissileReady = false;
    },
    selectMissile(missileId: number) {
      const supplyPanel = useSupplyPanelStore();
      if (!supplyPanel.isEnabledPower) return;

      const missile = this.missiles.find((m) => m.id === missileId)!;
      
      this.currentMissileId = missileId;
      
      this.isMissileReady = false;
      if (missile.isLaunched) return;
      const i = setTimeout(() => {
        this.isMissileReady = true;
        clearTimeout(i);
      }, 2000);
    },

    launchMissile() {
      const targetRadar = useTargetRadarStore();
      if (
        this.currentMissile && targetRadar.capturedTarget &&
        !this.currentMissile.isLaunched &&
        this.isMissileReady
      ) {
        //@ts-ignore
        this.engine.launchMissile(targetRadar.capturedTargetId)
        this.missiles = this.missiles.map((m) =>
          m.id === this.currentMissileId ? { ...m, isLaunched: true } : m
        );
        
        this.isMissileReady = false;
      }
    },

  },
});
