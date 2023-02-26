import type FlightObject from "./FlightObject";
import type SAMissile from "./OSAMissile";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import LoopHelper from "./LoopHelper";

export interface IRecognizedTargets {
  identifier: string;
  distance: number;
  azimut: number;
  elevation: number;
  radialVelocity: number;
  velocity: number;
  height: number;
  param: number;
  x: number;
  y: number;
  rotation: number;
  size: number;
  visibilityK: number;
}

export interface IFlightMissiles {
  identifier: number;
  x: number;
  y: number;
  z: number;
  velocity: number;
}

export interface IEventListenerPayload {
  targets: IRecognizedTargets[];
  missiles: IFlightMissiles[];
}
type EventListener = (eventName: string, arg: IEventListenerPayload | string | FlightObject[]) => void;

export default class SAM {
  private loopHelper = new LoopHelper();
  private isEnabled = false;

  private flightObjects: FlightObject[] = [];
  private missiles: SAMissile[] = [];

  private recognizedTargets: Record<string, IRecognizedTargets> = {};
  private flightMissiles: Record<string, IFlightMissiles> = {};

  private eventListener: EventListener | null = null;

  constructor(eventListener: EventListener) {
    this.eventListener = eventListener;
    this.update();
  }

  public setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  startMission(mission) {}
  launchMissile() {}
  /*
  public addFlightObject(flightObject: FlightObject) {
    this.flightObjects.push(flightObject);
  }

  public addMissile(missile: SAMissile) {
    this.missiles.push(missile);
  }*/

  public getFlightObject(id: string) {
    return this.flightObjects.find(fo => fo.identifier === id)
  }
  public getFlightObjectDesignation(id: string) {
    const target = this.getFlightObject(id);
    if (!target || target && target.isDestroyed) return null;
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
  }
  private update() {

    this.loopHelper.addLoop('recalulateLoop', () => {
      if (this.isEnabled) {
        this.recalculateTargets();
        this.recalculateMissiles();

        this.eventListener!('update', {
          targets: Object.keys(this.recognizedTargets).map(id => this.recognizedTargets[id]),
          missiles: Object.keys(this.flightMissiles).map(id => this.flightMissiles[id]),
        });
      }
    });

    this.loopHelper.addFixedLoop('refreshBIPLoop', SAM_PARAMS.RADAR_UPDATE_INTERVAL, () => {
      if (this.isEnabled) {
        this.eventListener!('updateBIP', [...this.flightObjects])
      }
    });
  }

  private isInVision(flightObject: FlightObject, targetDistance: number) {
    const height = flightObject.currentPoint.z;
    return Math.sqrt(2 * 6371.009 * SAM_PARAMS.RADAR_HEIGHT) +
      Math.sqrt(2 * 6371.009 * height) > targetDistance;
  }

  private recalculateTargets() {
    for (const flightObject of this.flightObjects) {
      if (!flightObject.isLaunched) continue;
      if (!flightObject.isDestroyed) {
        // Distance from SNR to target
        const targetDistance = Math.hypot(
          flightObject.currentPoint.x,
          flightObject.currentPoint.y,
        );
        // Azimut from SNR to target
        const targetAzimut = Math.atan2(
          flightObject.currentPoint.y,
          flightObject.currentPoint.x,
        );
        // Difference from SNR and target heights
        const targetHeightOffset = flightObject.currentPoint.z -
          SAM_PARAMS.RADAR_HEIGHT;
        // Vertical angle from SNR to target
        const targetElevation = (targetHeightOffset / targetDistance);

        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimut > flightObject.currentRotation
          ? targetAzimut - flightObject.currentRotation
          : flightObject.currentRotation - targetAzimut) - Math.PI;

        // Radial velocity
        const radialVelocity = flightObject.velocity * Math.cos(targetAngle);
        // Is visible from horizont
        const isTargetVisible = this.isInVision(flightObject, targetDistance);

        // Target param
        const targetParam = Math.abs(targetDistance * Math.tan(targetAngle));
        // Target size
        // Size in km; rcs converted to diameter of circle with same scale
        const targetSize = 2 * Math.sqrt(flightObject.rcs / Math.PI) / 1000;

        const inAllowedElevation = targetElevation > SAM_PARAMS.MIN_ELEVATION &&
          targetElevation < SAM_PARAMS.MAX_ELEVATION;

        const visibilityK = (SAM_PARAMS.MAX_DISTANCE * flightObject.rcs) / targetDistance;

        if (isTargetVisible && inAllowedElevation) {
          this.recognizedTargets[flightObject.identifier!] = {
            identifier: flightObject.identifier!,
            distance: targetDistance,
            azimut: targetAzimut < 0
              ? 2 * Math.PI + targetAzimut
              : targetAzimut,
            elevation: targetElevation,
            radialVelocity,
            velocity: flightObject.currentPoint.v,
            height: flightObject.currentPoint.z,
            param: targetParam,
            x: flightObject.currentPoint.x,
            y: flightObject.currentPoint.y,
            rotation: flightObject.currentRotation,
            size: targetSize,
            visibilityK: visibilityK > 1 ? 1 : visibilityK
          };
        } else {
          this.eventListener!('delete', flightObject.identifier!)
          delete this.recognizedTargets[flightObject.identifier!];
        }
      } else {
        this.eventListener!('delete', flightObject.identifier!)
        delete this.recognizedTargets[flightObject.identifier!];
      }
    }
  }

  private recalculateMissiles() {
    for (let missile of this.missiles) {
      if (!missile.isDestroyedMissile) {
        this.flightMissiles[missile.identifier!] = {
          identifier: missile.identifier!,
          x: missile.missileCurrentPoint.x,
          y: missile.missileCurrentPoint.y,
          z: missile.missileCurrentPoint.z,
          velocity: missile.velocity,
        };

        // Если цель в радиусе поражения
        if (missile.missileTargetDistance <= missile.missileKillRadius) {
          missile.destroyMissile();
          this.flightObjects.filter((fo) => {
            const x = fo.currentPoint.x;
            const y = fo.currentPoint.y;
            const z = fo.currentPoint.z;

            const distanceToMissile = Math.sqrt(
              Math.pow(x - missile.missileCurrentPoint.x, 2) +
              Math.pow(y - missile.missileCurrentPoint.y, 2) +
              Math.pow(z - missile.missileCurrentPoint.z, 2),
            );

            return distanceToMissile <= missile.missileKillRadius
              ? true
              : false;
          }).map((fo) => fo.kill());
        }
      } else {
        delete this.flightMissiles[missile.identifier!];
      }
    }
  }

  getTargetOnAzimutAndElevation(azimut: number, elevation: number) {
    return Object.keys(this.recognizedTargets).find(id => {
      const target = this.recognizedTargets[id];
      return (Math.abs(target.azimut - azimut) <= SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY / 2) &&
        (Math.abs(elevation - target.elevation) <= SAM_PARAMS.RADAR_ELEVATION_DETECT_ACCURACY / 2)
    }) || null
  }

  getTargetOnAzimutElevationAndDistance(azimut: number, elevation: number, distance: number) {
    const id = this.getTargetOnAzimutAndElevation(azimut, elevation);
    if (!id) return null
    const target = this.recognizedTargets[id];
    return Math.abs(target.distance - distance) <= SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / 2 ? id : null;
  }
}
