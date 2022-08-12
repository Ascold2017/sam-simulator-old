import { defineStore } from "pinia";
import { useSupplyPanelStore } from '@/store/supplyPanel'
export enum MissileStates {
  READY = "READY",
  IN_RANGE = "IN_RANGE",
  LAUNCH = "LAUNCH",
  RESET = "RESET",
}

export enum DetonatorModes {
  AUTO = "AUTO",
  ON_2_SEC = "ON_2_SEC",
}

interface IMissile {
  id: number;
  isLaunched: boolean;
  velocity: number;
}
export const useWeaponPanelStore = defineStore("weaponPanel", {
  state: () => ({
    missiles: Array(8).fill(0).map((_, i) => ({ id: i + 1, isLaunched: false, velocity: 1200 })) as IMissile[],
    currentMissileId: null as number | null,
    missileState: null as MissileStates | null,
    detonatorMode: DetonatorModes.AUTO,
  }),

  getters: {
    currentMissile(): IMissile | null {
      return this.missiles.find(m => m.id === this.currentMissileId) || null
    }
  },

  actions: {
    setDefaultValues() {
      this.missiles = Array(8).fill(0).map((_, i) => ({ id: i + 1, isLaunched: false, velocity: 1200 }));
      this.currentMissileId = null;
      this.missileState = null;
      this.detonatorMode = DetonatorModes.AUTO
    },
    setDetonatorMode(mode: DetonatorModes) {
      const supplyPanel = useSupplyPanelStore();
      if (!supplyPanel.isEnabledPower) return
      
      this.detonatorMode = mode;
    },
    selectMissile(missileId: number) {
      const supplyPanel = useSupplyPanelStore();
      if (!supplyPanel.isEnabledPower) return

      const missile = this.missiles.find((m) => m.id === missileId)!;
      if (missile.isLaunched) return;
      this.currentMissileId = missileId;
      this.missileState = null;
      const i = setTimeout(() => {
        this.missileState = MissileStates.READY;
        clearTimeout(i);
      }, 2000);
    },
  },
});
