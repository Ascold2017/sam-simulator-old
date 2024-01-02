import Sounds from "@/const/SOUNDS/index";
import { defineStore } from "pinia";

export interface IRadarObject {
  type: "DETECTED_RADAR_OBJECT" | "UNDETECTED_RADAR_OBJECT" | "SNOW_RADAR_OBJECT",
  id: string;
  x: number;
  y: number;
  azimuth: number;
  elevation: number;
  distance: number;
  rotation: number;
  velocity: number;
  radialVelocity: number;
  height: number;
  param: number;
  size: number;
  visibilityK: number;
  isMissile?: boolean;
}
export interface IMissileChannel {
  id: number;
  isBusy: boolean;
}
export const useMainStore = defineStore('mainStore', {
  state: () => ({
    socket: null as WebSocket | null,
    isEnabled: true,
    currentTargetId: null as string | null,
    radarObjects: [
      {
        "type": "DETECTED_RADAR_OBJECT",
        "isMissile": false,
        "id": "Test-1",
        "distance": 39530.89881343188,
        "azimuth": 4.1101459810718115,
        "elevation": 0.012015917023333749,
        "radialVelocity": 11.663090389651313,
        "velocity": 13.9,
        "height": 500.0,
        "param": 25630.314959646836,
        "x": -22393.948947460896, "y": -32576.111056053098,
        "rotation": 1.5437758777631954,
        "size": 0.252313252202016,
        "visibilityK": 0.05
      },
      { "type": "SNOW_RADAR_OBJECT", "id": "0.8355231706330902", "distance": 36973.33949258506, "azimuth": 3.8653724120474404, "elevation": 0.001353303990652179, "radialVelocity": -39.26127805206212, "velocity": 72.31092522947662, "height": 75.03616788305317, "param": 57185.465955314794, "x": -27704.42091447438, "y": -24484.544002851773, "rotation": 2.8685231167844036, "size": 0.9592199914131213, "visibilityK": 0.7226471999956399 },
      { "type": "SNOW_RADAR_OBJECT", "id": "0.298656992411486", "distance": 48125.177118577434, "azimuth": 2.428849692395677, "elevation": 3.9806287736604665E-4, "radialVelocity": -18.887436240216974, "velocity": 56.86374466228627, "height": 44.15684647757156, "param": 136662.8288961104, "x": -36410.11677542548, "y": 31469.605480436658, "rotation": 1.1966381130971, "size": 0.897272880583782, "visibilityK": 0.6323229792541359 },
      { "type": "SNOW_RADAR_OBJECT", "id": "0.31669802711862494", "distance": 37250.84829017021, "azimuth": 3.4151524744549895, "elevation": -1.3421278084561092E-4, "radialVelocity": -42.51238878282587, "velocity": 156.23963494159443, "height": 20.000460062118286, "param": 131737.2822209988, "x": -35865.6857641461, "y": -10063.711194425454, "rotation": 2.119928083691113, "size": 0.9537469497474222, "visibilityK": 0.7144242793226455 },
    ],
    selectedTargetIds: [] as string[],
    missileChannels: [
      { "id": 0, "isBusy": false }, { "id": 1, "isBusy": false }, { "id": 2, "isBusy": false }
    ] as IMissileChannel[],
    missilesLeft: 8,
    samParams: {
      MAX_DISTANCE: 80000, // 80 km
      MIN_CAPTURE_RANGE: 2000,
      MAX_CAPTURE_RANGE: 60000,
      MISSILE_MAX_DISTANCE: 50000,
      MISSILES_COUNT: 6
    }
  }),
  getters: {
    detectedEnemies(state) {
      return state.radarObjects.filter(ro => ro.type === 'DETECTED_RADAR_OBJECT' && !ro.isMissile)
    }
  },

  actions: {
    init() {
      this.socket = new WebSocket('ws://127.0.0.1:8000');
      this.socket.addEventListener('open', () => console.info('SOCKET OPENED'));
      this.socket.addEventListener('close', () => console.info('SOCKET CLOSED'));
      this.socket.addEventListener('error', (e) => console.error('SOCKET ERROR', e));
      this.socket.addEventListener('message', (message) => {
        const [type, jsonPayload] = message.data.split('|') as string[];
        const actions: Record<string, (payload: any) => void> = {
          'IS_ENABLED_UPDATE': (payload: boolean) => this.isEnabled = payload,
          'RADAR_OBJECTS_UPDATE': (payload: IRadarObject[]) => this.radarObjects = [...payload],
          'SELECTED_TARGET_IDS_UPDATE': (payload: string[]) => this.selectedTargetIds = [...payload],
          'MISSILE_CHANNELS_UPDATE': (payload: IMissileChannel[]) => this.missileChannels = [...payload],
          'MISSILES_LEFT_UPDATE': (payload: number) => this.missilesLeft = payload
        };

        const action = actions[type];
        // @ts-ignore
        if (action) {
          const payload = JSON.parse(jsonPayload);
          action(payload);
        }
      });

    },
    setIsEnabled(value: boolean) {
      if (value) {
        Sounds.startEngine();
        const i = setTimeout(() => {

          //TODO - post on
          clearTimeout(i);
        }, 3000);
      } else {
        Sounds.stopEngine();
        // TODO - post off
      }
    },
    seekTarget() {
      let index = this.detectedEnemies.findIndex(dro => dro.id === this.currentTargetId) || 0;
      if (index === this.detectedEnemies.length - 1) {
        index = 0;
      } else {
        index++;
      }

      this.currentTargetId = this.detectedEnemies[index]?.id || null;

    },
    selectTarget() {
      // TODO - post select target
    },
    unselectTarget() {
      // TODO - post unselect target
    },
    resetTargets() {
      // TODO - post reset targets
    },
  }
})