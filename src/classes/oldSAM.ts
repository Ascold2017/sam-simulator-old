import type FlightObject from "./FlightObject";
import type SAMissile from "./SAMissile";
import SOCScreen from "./SOCScreen";
import Sounds from "@/classes/Sounds";

type EventListener = (arg0: string, arg1: any) => void;

interface ISAM {
  mainScreenCanvas: HTMLCanvasElement;
  eventListener: EventListener;
  distanceDetectRange: number;
  azimutDetectRange: number;
  initialDistance: number;
  initialRayWidth: number;
  maxDistance: number;
  missileVelocity: number;
  minVerticalAngle: number;
  maxVerticalAngle: number;
  scale: number;
}

interface ITrackingTargetParams {
  number: string;
  distance: number;
  velocity: number;
  height: number;
  param: number;
  radialVelocity: number;
}
export default class SAM {
  private socScreen: SOCScreen | null = null;
  private azimut = -Math.PI / 2; // rad
  private targetDistance = 0; // km
  private minVerticalAngle = 0; // degree
  private maxVerticalAngle = 0; // degree
  private maxDistance = 0;
  private flightObjects: FlightObject[] = [];
  private distanceDetectRange = 0; // km
  private azimutDetectRange = 0; // deg

  private radarHeight = 36; /// m
  private trackingTargetIdentifiers: Record<string, ITrackingTargetParams> = {};
  private eventListener: EventListener | null = null;
  private missiles: SAMissile[] = [];
  private missileVelocity = 0;
  private isEnabled = false;
  private targetCounter = 0;

  constructor({
    mainScreenCanvas,
    eventListener,
    distanceDetectRange,
    azimutDetectRange,
    initialDistance,
    initialRayWidth,
    maxDistance,
    missileVelocity,
    minVerticalAngle,
    maxVerticalAngle,
    scale,
  }: ISAM) {
    this.socScreen = new SOCScreen({
      scale,
      canvasRadar: mainScreenCanvas,
      distanceDetectRange: distanceDetectRange,
    });
    this.eventListener = eventListener;
    this.distanceDetectRange = distanceDetectRange;
    this.azimutDetectRange = azimutDetectRange;
    this.targetDistance = initialDistance;
    this.maxDistance = maxDistance;
    this.missileVelocity = missileVelocity;
    this.minVerticalAngle = minVerticalAngle;
    this.maxVerticalAngle = maxVerticalAngle;

    setInterval(() => {
      this.calculateTargetsParams();
      this.calculateMissilesParams();
    }, 0);
  }

  setIsEnabled(value: boolean) {
    if (value) {
      Sounds.startEngine();
      const t = setTimeout(() => {
        this.isEnabled = true;
        this.eventListener!("isEnabled", true);
        clearTimeout(t);
      }, 3000);
    } else {
      Sounds.stopEngine();
      this.isEnabled = false;
      this.socScreen!.isEnabled = false;
      this.eventListener!("isEnabled", false);
      this.eventListener!("isEnabledSOC", false);
    }
  }

  get azimutDeg() {
    const azimut = (this.azimut + Math.PI / 2) * (180 / Math.PI);
    return azimut < 0 ? azimut + 360 : azimut;
  }

  setAzimut(azimut: number) { // degree
    if (!this.isEnabled) return;
    if (azimut > 360) {
      azimut = azimut - 360;
    }
    if (azimut < 0) {
      azimut = 360 + azimut;
    }

    if (azimut > 270) {
      azimut = azimut - 360;
    }

    this.azimut = (azimut - 90) * (Math.PI / 180);
    this.socScreen!.setTargetRayAngle(this.azimut);
  }

  get gain() {
    return this.socScreen!.gain
  }

  setIndicatorTargetDistance(distance: number) {
    if (!this.isEnabled) return;
    if (distance > 0 && distance < this.maxDistance) {
      this.targetDistance = distance;
      this.socScreen!.setTargetDistance(distance);
    }
  }

  setIsEnabledSOC(value: boolean) {
    if (!this.isEnabled) return;
    Sounds.click(value);
    if (value) {
      const t = setTimeout(() => {
        this.socScreen!.isEnabled = true;
        this.eventListener!("isEnabledSOC", true);
        clearTimeout(t);
      }, 2000);
    } else {
      this.socScreen!.isEnabled = false;
      this.eventListener!("isEnabledSOC", false);
    }
  }

  setGain(value: number) {
    Sounds.click();
    this.socScreen!.gain = value;
  }

  get indicatorTargetDistance() {
    return this.targetDistance;
  }

  get distanceScale() {
    return this.socScreen!.distanceScale;
  }

  setDistanceScale(value: number) {
    Sounds.click();
    this.socScreen!.setScale(value);
  }

  get capturedTargets() {
    return Object.keys(this.trackingTargetIdentifiers).map((identifier) => ({
      identifier,
      ...this.trackingTargetIdentifiers[identifier],
    }));
  }

  getTracketTarget(identifier: string) {
    return this.flightObjects.find((fo) => fo.identifier === identifier)!;
  }

  private updateTrackingTargetParams(
    identifier: string,
    params: ITrackingTargetParams,
  ) {
    if (!this.trackingTargetIdentifiers[identifier]) return;
    this.trackingTargetIdentifiers[identifier] = params;
  }

  private getVisibleDistance(flightObject: FlightObject) {
    const height = flightObject.currentPoint.z;
    return Math.sqrt(2 * 6371.009 * this.radarHeight) +
      Math.sqrt(2 * 6371.009 * height);
  }

  private calculateTargetsParams() {
    for (const flightObject of this.flightObjects) {
      const isCaptured = !!this
        .trackingTargetIdentifiers[flightObject.identifier!];
      if (!flightObject.isLaunched) return;
      if (!flightObject.isDestroyed) {
        // Distance from SNR to target
        const targetDistance = Math.hypot(
          flightObject.currentPoint.x,
          flightObject.currentPoint.y,
        );
        // Azimut from SNR to target
        const targetAzimutAngle = Math.atan2(
          flightObject.currentPoint.y,
          flightObject.currentPoint.x,
        );
        // Difference from SNR and target heights
        const targetHeightOffset = flightObject.currentPoint.z -
          this.radarHeight / 1000;
        // Vertical angle from SNR to target
        const targetVerticalAngle = (targetHeightOffset / targetDistance);

        const targetAngle = (targetAzimutAngle > flightObject.currentRotation
          ? targetAzimutAngle - flightObject.currentRotation
          : flightObject.currentRotation - targetAzimutAngle) - Math.PI;

        // Radial velocity
        const radialVelocity = flightObject.velocity * Math.cos(targetAngle);

        // Target param
        const targetParam = Math.abs(targetDistance * Math.tan(targetAngle));
        const visibleDistance = this.getVisibleDistance(flightObject);
        const targetSize = 2 * Math.sqrt(flightObject.rcs / Math.PI) / 1000; // Size in km; rcs converted to diameter of circle with same scale
        const isTargetVisible = visibleDistance >= targetDistance;
        const timeToHitKmS = targetDistance /
          ((radialVelocity + this.missileVelocity) / 1000);
        const distanceToHitKm = (timeToHitKmS * (this.missileVelocity / 1000));
        const hitX = distanceToHitKm *
          Math.cos(targetAzimutAngle);
        const hitY = distanceToHitKm *
          Math.sin(targetAzimutAngle);
        if (isTargetVisible) {
          this.socScreen?.setTargetParams({
            identifier: flightObject.identifier!,
            targetDistance,
            targetSize,
            targetX: flightObject.currentPoint.x,
            targetY: flightObject.currentPoint.y,
            targetRotation: flightObject.currentRotation,
            isCaptured,
            hitX,
            hitY,
          });
        } else {
          this.socScreen?.removeTarget(flightObject.identifier!);
          this.resetCapture(flightObject.identifier!);
        }

        if (isCaptured) {
          if (
            targetVerticalAngle < this.minVerticalAngle * Math.PI / 180 ||
            targetVerticalAngle > this.maxVerticalAngle * Math.PI / 180 ||
            targetDistance > this.maxDistance
          ) {
            this.resetCapture(flightObject.identifier!);
          }

          this.updateTrackingTargetParams(flightObject.identifier!, {
            number:
              this.trackingTargetIdentifiers[flightObject.identifier!].number,
            distance: +targetDistance.toFixed(1),
            velocity: +flightObject.velocity.toFixed(0),
            height: +flightObject.currentPoint.z.toFixed(1),
            param: +targetParam.toFixed(1),
            radialVelocity: +radialVelocity.toFixed(0),
          });
        }
      } else {
        isCaptured && this.resetCapture(flightObject.identifier!);
        this.socScreen?.removeTarget(flightObject.identifier!);
      }
    }
    this.eventListener!("capturedTargets", this.capturedTargets);
  }

  private calculateMissilesParams() {
    for (let missile of this.missiles) {
      if (!missile.isDestroyedMissile) {
        this.socScreen!.setMissileParams({
          identifier: missile.indentifier!,
          missileX: missile.missileCurrentPoint.x,
          missileY: missile.missileCurrentPoint.y,
        });
      } else {
        this.socScreen?.removeMissile(missile.indentifier!);
      }
    }
  }

  public captureTarget() {
    Sounds.click();
    this.flightObjects.forEach((flightObject) => {
      // Azimut from SNR to target
      const targetAzimutAngle = Math.atan2(
        flightObject.currentPoint.y,
        flightObject.currentPoint.x,
      );
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      const isCapturedByAzimut = Math.abs(this.azimut - targetAzimutAngle) <
        (this.azimutDetectRange * Math.PI / 180);

      const isCapturedByDistance =
        Math.abs(targetDistance - this.targetDistance) <
          this.distanceDetectRange;

      if (
        isCapturedByAzimut && isCapturedByDistance &&
        !this.trackingTargetIdentifiers[flightObject.identifier!]
      ) {
        this.trackingTargetIdentifiers[flightObject.identifier!] = {
          number: (this.targetCounter + 1).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
          distance: 0,
          velocity: 0,
          radialVelocity: 0,
          height: 0,
          param: 0,
        };
        this.targetCounter++;
      }
    });
  }

  public resetCapture(identifier: string) {
    Sounds.click();
    delete this.trackingTargetIdentifiers[identifier];
    this.missiles.forEach((missile) => missile.destroyMissile());
  }

  public addMissile(missile: SAMissile) {
    this.missiles.push(missile);
  }

  public addFlightObject(flightObject: FlightObject) {
    this.flightObjects.push(flightObject);
  }
  
}
