import type { IFlightMission } from "@/components/Editor/Editor";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import Enemy from "./FlightObject/Enemy";
import LoopEngine from "./LoopEngine";
import SAM, { type IFlightMissiles, type IRecognizedFlightObjects } from "./SAM";

export interface IPoint {
    x: number;
    y: number;
    z: number;
    v: number;
}

export interface IMission {
    id: number;
    name: string;
    missions: IFlightMission[]
}
export interface IEventListenerPayload {
    targets: IRecognizedFlightObjects[];
    missiles: IFlightMissiles[];
  }
export type EventListener = (name: string, payload: IEventListenerPayload | string) => void

export default class Engine extends LoopEngine {
   
    flightObjects: Enemy[] = [];
    private readonly sam: SAM
    private readonly eventListener: EventListener;
    private isEnabled = false;
    private recognizedFlightObjects: IRecognizedFlightObjects[] = [];

    constructor(eventListener: EventListener) {
        super();
        this.eventListener = eventListener;
        this.sam = new SAM()
        this.addLoop('recalculateTargets', () => {
            this.recognizedFlightObjects = this.sam.recaclulateRecognizedFlightObjects(this.flightObjects);
            this.eventListener('update', {
                targets: this.recognizedFlightObjects,
                missiles: []
            })
        })
    }

    startMission(flightMissions: IFlightMission[]) {
        flightMissions.forEach(m => this.addEnemy(m.identifier, m.points, m.time, m.rcs));
    }

    setIsEnabled(value: boolean) {
        this.isEnabled = value;
    }

    launchMissile(targetId: string) {
        if (!targetId) return;
    }

    private addEnemy(name: string, points: IPoint[], latency: number, visibilityK: number) {
        const t = setTimeout(() => {
            const enemy = new Enemy(this, name, points, visibilityK, false);
            this.addFlightObject(enemy);
            clearTimeout(t);
        }, latency);
    }
    /*
    addMissile(name: string, target: Enemy, samName: string) {
      const sam = this.sams.find(s => s.name === samName);
      const missile = new Missile(this, name, target, sam);
      this.addFlightObject(missile);
    }
  */

    private addFlightObject(flightObject: Enemy) {
        this.flightObjects.push(flightObject);
        this.addLoop(
            flightObject.name!,
            (time) => flightObject.update(time!),
        );
    }

    removeFlightObject(name: string) {
        this.removeLoop(name);
        this.flightObjects = this.flightObjects.filter((fo) => fo.name !== name);
    }
    getTargetOnAzimutAndElevation(azimuth: number, elevation: number) {
        const fo =  this.recognizedFlightObjects.find(fo => {
          return (Math.abs(fo.azimuth - azimuth) <= SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY / 2) &&
            (Math.abs(elevation - fo.elevation) <= SAM_PARAMS.RADAR_ELEVATION_DETECT_ACCURACY / 2)
        });

        return fo ? fo.identifier : null;
      }
    
      getTargetOnAzimutElevationAndDistance(azimuth: number, elevation: number, distance: number) {
        const id = this.getTargetOnAzimutAndElevation(azimuth, elevation);
        if (!id) return null;
        const fo = this.recognizedFlightObjects.find(f => f.identifier === id)!;
        return Math.abs(fo.distance - distance) <= SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / 2 ? fo.identifier : null;
      }

      public getFlightObject(id: string) {
        return this.flightObjects.find(fo => fo.name === id)
      }
      /*
      public getFlightObjectDesignation(id: string) {
        const target = this.getFlightObject(id);
        if (!target) return null;
        // Distance from SNR to target
        const targetDistance = Math.hypot(
          target.currentPoint.x,
          target.currentPoint.y,
        );
        // Azimut from SNR to target
        const targetAzimut = Math.atan2(
          target.currentPoint.y,
          target.currentPoint.x,
        );
        // Difference from SNR and target heights
        const targetHeightOffset = target.currentPoint.z -
          SAM_PARAMS.RADAR_HEIGHT;
        // Vertical angle from SNR to target
        const targetElevation = (targetHeightOffset / targetDistance);
    
        return {
          azimut: targetAzimut + SAM_PARAMS.DESIGNATION_ANGLE_ACCURACY * (Math.random() * 2 - 1),
          elevation: targetElevation + SAM_PARAMS.DESIGNATION_ANGLE_ACCURACY * (Math.random() * 2 - 1),
          distance: targetDistance > SAM_PARAMS.MAX_DISTANCE ? SAM_PARAMS.MAX_DISTANCE - SAM_PARAMS.RADAR_DISTANCE_WINDOW : targetDistance + SAM_PARAMS.DESIGNATION_DISTANCE_ACCURACY * (Math.random() * 2 - 1),
        }
      }*/
    
}