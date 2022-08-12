import { defineStore } from "pinia";
import { useSupplyPanelStore } from '@/store/supplyPanel'
import SAMissile from "@/classes/SAMissile";
import { useTargetRadarStore } from "./targetRadar";
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
  maxDistance: number
}
export const useWeaponPanelStore = defineStore("weaponPanel", {
  state: () => ({
    missiles: Array(8).fill(0).map((_, i) => ({ id: i + 1, isLaunched: false, velocity: 1200, maxDistance: 50 })) as IMissile[],
    currentMissileId: null as number | null,
    missileState: null as MissileStates | null,
    detonatorMode: DetonatorModes.AUTO,
    launchedMissiles: [] as SAMissile[]
  }),

  getters: {
    currentMissile(): IMissile | null {
      return this.missiles.find(m => m.id === this.currentMissileId) || null
    }
  },

  actions: {
    setDefaultValues() {
      this.missiles = Array(8).fill(0).map((_, i) => ({ id: i + 1, isLaunched: false, velocity: 1200, maxDistance: 50 }));
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

    launchMissile() {
      const targetRadar = useTargetRadarStore()
      if (this.currentMissile && targetRadar.capturedTarget && !this.currentMissile.isLaunched && this.missileState === MissileStates.READY) {
        const missile = new SAMissile(this.currentMissileId!, this.currentMissile.maxDistance, this.currentMissile.velocity, { x: 0, y: 0, z: 0.025 });
        missile.setTargetPosition({
          x: targetRadar.capturedTarget.x,
          y: targetRadar.capturedTarget.y,
          z: targetRadar.capturedTarget.height
        });
        missile.launch();
        //@ts-ignore
        this.sam.addMissile(missile);
        this.launchedMissiles.push(missile);
        this.missiles = this.missiles.map(m => m.id === this.currentMissileId ? {...m, isLaunched: true } : m)
      }
    },

    resetMissile() {
      if (this.currentMissileId) {
        this.launchedMissiles.find(m => m.identifier === this.currentMissileId)?.destroyMissile();
        this.launchedMissiles = this.launchedMissiles.filter(m => m.identifier !== this.currentMissileId);
      }
    }
  },
});
