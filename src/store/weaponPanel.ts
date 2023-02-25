import { defineStore } from "pinia";
import { useSupplyPanelStore } from "@/store/supplyPanel";
import SAMissile from "@/core/SAMissile";
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

export enum TrackingModes {
  THREE_POINTS = 'THREE_POINTS',
  HALF_STRAIGHTENING = 'HALF_STRAIGHTENING'
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
    trackingMode: TrackingModes.THREE_POINTS,
    currentMissileId: null as number | null,
    isMissileReady: false,
    detonatorMode: DetonatorModes.AUTO,
    launchedMissiles: [] as SAMissile[],
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
      this.detonatorMode = DetonatorModes.AUTO;
    },
    setTrackingMode(mode: TrackingModes) {
      this.trackingMode = mode
    },
    setDetonatorMode(mode: DetonatorModes) {
      const supplyPanel = useSupplyPanelStore();
      if (!supplyPanel.isEnabledPower) return;

      this.detonatorMode = mode;
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
        const missile = new SAMissile(
          this.currentMissileId!,
          this.currentMissile.maxDistance,
          this.currentMissile.velocity,
          { x: 0.2, y: 0.2, z: 0.025 },
          //@ts-ignore
          this.sam.getFlightObject(targetRadar.capturedTargetId),
        );
        missile.launch();
        //@ts-ignore
        this.sam.addMissile(missile);
        this.launchedMissiles.push(missile);
        this.missiles = this.missiles.map((m) =>
          m.id === this.currentMissileId ? { ...m, isLaunched: true } : m
        );
        this.isMissileReady = false;
      }
    },

    resetMissile() {
      if (this.currentMissileId) {
        this.launchedMissiles.find((m) =>
          m.identifier === this.currentMissileId
        )?.destroyMissile();
        this.launchedMissiles = this.launchedMissiles.filter((m) =>
          m.identifier !== this.currentMissileId
        );
      }
    },
  },
});
