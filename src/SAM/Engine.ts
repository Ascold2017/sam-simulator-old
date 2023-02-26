import type { IFlightMission } from "@/components/Editor/Editor";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import type BaseFlightObject from "./FlightObject/BaseFlightObject";
import Enemy from "./FlightObject/Enemy";
import Missile from "./FlightObject/Missile";
import LoopEngine from "./LoopEngine";
import SAM, { type IFlightMissile, type IRecognizedFlightObject } from "./SAM";
import Sounds from "./Sounds";

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
  targets: IRecognizedFlightObject[];
  missiles: IFlightMissile[];
}
export type EventListener = (name: string, payload: IEventListenerPayload | IRecognizedFlightObject[]) => void

export default class Engine extends LoopEngine {

  flightObjects: BaseFlightObject[] = [];
  private readonly sam: SAM
  private readonly eventListener: EventListener;
  private isEnabled = false;
  private recognizedFlightObjects: IRecognizedFlightObject[] = [];
  private launchedMissiles: IFlightMissile[] = []

  constructor(eventListener: EventListener) {
    super();
    this.eventListener = eventListener;
    this.sam = new SAM()
    this.addLoop('recalculateTargets', () => {
      this.recognizedFlightObjects = this.sam.recaclulateRecognizedFlightObjects(this.flightObjects.filter(fo => fo instanceof Enemy) as Enemy[]);
      this.launchedMissiles = this.flightObjects.filter(fo => fo instanceof Missile)
        .map(m => ({
          identifier: m.name,
          x: m.getCurrentPoint().x,
          y: m.getCurrentPoint().y,
          z: m.getCurrentPoint().z,
          velocity: m.getCurrentPoint().v
        }));
      this.eventListener('update', {
        targets: this.recognizedFlightObjects,
        missiles: this.launchedMissiles
      })
    });
  }

  startMission(flightMissions: IFlightMission[]) {
    flightMissions.forEach(m => this.addEnemy(m.identifier, m.points, m.time, m.rcs));
  }

  setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  launchMissile(targetId: string) {
    if (!targetId) return;
    const target = this.flightObjects.find(fo => fo.name === targetId)
    if (!target) return
    const missile = new Missile(this, target as Enemy);
    Sounds.missileStart();
    this.addFlightObject(missile);
  }

  private addEnemy(name: string, points: IPoint[], latency: number, visibilityK: number) {
    const t = setTimeout(() => {
      const enemy = new Enemy(this, name, points, visibilityK, false);
      this.addFlightObject(enemy);
      clearTimeout(t);
    }, latency);
  }

  private addFlightObject(flightObject: Enemy | Missile) {
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
    const fo = this.recognizedFlightObjects.find(fo => {
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

}