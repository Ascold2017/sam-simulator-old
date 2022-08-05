import type FlightObject from "./FlightObject";
import type SAMissile from "./SAMissile";
import type SNRDistanceScreen from "./SNRDistanceScreen";
import type SNRTargetScreen from "./SNRTargetScreen";
import type SOCScreen from "./SOCScreen";
import Sounds from "@/classes/Sounds";
type EventListener = (arg0: string, arg1: any) => void;

interface ISAM {
  snrTargetScreen: SNRTargetScreen;
  snrDistanceScreen: SNRDistanceScreen;
  socScreen: SOCScreen;
  eventListener: EventListener;
  distanceDetectRange: number;
  initialDistance: number;
  initialRayWidth: number;
  maxDistance: number;
  missileVelocity: number;
  missileMaxDistance: number;
  minVerticalAngle: number;
  maxVerticalAngle: number;
}
export default class SAM {
  private snrTargetScreen: SNRTargetScreen | null = null;
  private snrDistanceScreen: SNRDistanceScreen | null = null;
  private socScreen: SOCScreen | null = null;
  private azimut = -Math.PI / 2; // rad
  private verticalAngle = 0; // rad
  private targetDistance = 0; // km
  private minVerticalAngle = 0; // degree
  private maxVerticalAngle = 0; // degree
  private maxDistance = 0;
  private flightObjects: FlightObject[] = [];
  private rayWidth = 0; // degree
  private distanceTrackingAccuracy = 0.2; // km
  private distanceDetectRange = 0; // km

  private radarHeight = 36; /// m
  private trackingDirectionTargetIdentifier: string | null = null;
  private trackingDistanceTargetIdentifier: string | null = null;
  private eventListener: EventListener | null = null;
  private missiles: SAMissile[] = [];
  private missileVelocity = 0;
  private missileMaxDistance = 0;
  distanceScale = 1;
  private isEnabled = false;

  constructor({
    snrTargetScreen,
    snrDistanceScreen,
    socScreen,
    eventListener,
    distanceDetectRange,
    initialDistance,
    initialRayWidth,
    maxDistance,
    missileVelocity,
    missileMaxDistance,
    minVerticalAngle,
    maxVerticalAngle,
  }: ISAM) {
    this.snrTargetScreen = snrTargetScreen;
    this.snrDistanceScreen = snrDistanceScreen;
    this.socScreen = socScreen;
    this.eventListener = eventListener;
    this.distanceDetectRange = distanceDetectRange;
    this.targetDistance = initialDistance;
    this.rayWidth = initialRayWidth;
    this.maxDistance = maxDistance;
    this.missileVelocity = missileVelocity;
    this.missileMaxDistance = missileMaxDistance;
    this.minVerticalAngle = minVerticalAngle;
    this.maxVerticalAngle = maxVerticalAngle;

    setInterval(() => {
      this.calculateTargetsParams();
      this.calculateMissiles();
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
      this.snrDistanceScreen!.isEnabled = false;
      this.snrTargetScreen!.isEnabled = false;
      this.socScreen!.isEnabled = false;
      this.eventListener!("isEnabled", false);
      this.eventListener!("isEnabledSOC", false);
      this.eventListener!("isEnabledSNR", false);
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

  setIsEnabledSNR(value: boolean) {
    if (!this.isEnabled) return;
    Sounds.click(value);
    if (value) {
      const t = setTimeout(() => {
        this.snrDistanceScreen!.isEnabled = true;
        this.snrTargetScreen!.isEnabled = true;
        this.eventListener!("isEnabledSNR", true);
        clearTimeout(t);
      }, 2000);
    } else {
      this.snrDistanceScreen!.isEnabled = false;
      this.snrTargetScreen!.isEnabled = false;
      this.eventListener!("isEnabledSNR", false);
    }
  }

  get trackedTarget(): FlightObject | null {
    return this.flightObjects.find((fo) =>
      fo.identifier === this.trackingDirectionTargetIdentifier
    ) || null;
  }

  get azimutDeg() {
    const azimut = (this.azimut + Math.PI / 2) * (180 / Math.PI);
    return azimut < 0 ? azimut + 360 : azimut;
  }

  private soundTimeout: number | null = null;

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
    this.snrTargetScreen!.setAzimut(this.azimut);
    this.socScreen!.setTargetRayAngle(this.azimut);
    Sounds.turnStart();
    this.soundTimeout && clearTimeout(this.soundTimeout);
    this.soundTimeout = setTimeout(() => {
      Sounds.turnStop();
      clearInterval(this.soundTimeout!);
    }, 300);
  }

  get verticalAngleDeg() {
    return this.verticalAngle * (180 / Math.PI);
  }

  setVerticalAngle(verticalAngle: number) { // degree
    if (!this.isEnabled) return;
    if (
      verticalAngle > this.minVerticalAngle &&
      verticalAngle < this.maxVerticalAngle
    ) {
      this.verticalAngle = verticalAngle * Math.PI / 180;
      this.snrTargetScreen!.setVerticalAngle(this.verticalAngle);
    }
  }

  setDistanceScale(value: number) {
    this.distanceScale = value;
    Sounds.click();
    this.socScreen!.setScale(this.distanceScale);
    this.snrDistanceScreen!.setScale(this.distanceScale);
  }

  get radarRayWidth() {
    return this.rayWidth;
  }

  setRadarRayWidth(deg: number) {
    Sounds.click();
    this.rayWidth = deg;
  }

  public addFlightObject(flightObject: FlightObject) {
    this.flightObjects.push(flightObject);
  }

  private getVisibleDistance(flightObject: FlightObject) {
    const height = flightObject.currentPoint.z;
    return Math.sqrt(2 * 6371.009 * this.radarHeight) +
      Math.sqrt(2 * 6371.009 * height);
  }

  private calculateTargetsParams() {
    for (const flightObject of this.flightObjects) {
      const isCapturedByDirection =
        flightObject.identifier! === this.trackingDirectionTargetIdentifier;
      const isCapturedByDistance =
        flightObject.identifier! === this.trackingDistanceTargetIdentifier;

      if (flightObject.isLaunched && !flightObject.isDestroyed) {
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

        // Angle of ray of SNR
        const rayWidthRad = this.rayWidth * Math.PI / 180;
        // Difference of SNR azimut and target azimut
        const targetAzimutOffset = this.azimut - targetAzimutAngle;
        // Difference of SNR vertical angle and target vertical angle
        const targetVerticalOffset = targetVerticalAngle - this.verticalAngle;

        const targetAngle = (this.azimut > flightObject.currentRotation
          ? this.azimut - flightObject.currentRotation
          : flightObject.currentRotation - this.azimut) - Math.PI;

        // Radial velocity
        const radialVelocity = flightObject.velocity * Math.cos(targetAngle);

        // Target param
        const targetParam = Math.abs(targetDistance * Math.tan(targetAngle));
        const visibleDistance = this.getVisibleDistance(flightObject);
        const targetSize = 2 * Math.sqrt(flightObject.rcs / Math.PI) / 1000; // Size in km; rcs converted to diameter of circle with same scale
        const isTargetVisible = visibleDistance >= targetDistance;
        if (isTargetVisible) {
          this.socScreen?.setTargetParams(
            flightObject.identifier!,
            targetDistance,
            targetSize,
            flightObject.currentPoint.x,
            flightObject.currentPoint.y,
          );
        } else {
          this.socScreen?.removeTarget(flightObject.identifier!);
        }

        // If target inside of SNR ray
        if (
          Math.abs(targetAzimutOffset) < (rayWidthRad / 2) &&
          Math.abs(targetVerticalOffset) < (rayWidthRad / 2) && isTargetVisible
        ) {
          // Calculate target position on canvas
          const targetOffsetX = -(targetAzimutOffset / rayWidthRad * 2);
          const targetOffsetY = -(targetVerticalOffset / rayWidthRad * 2);

          const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);

          const targetSpotSize = targetSize / rayWidth;
          const targetVisibilityK = (Math.abs(targetOffsetX) + Math.abs(targetOffsetY));
          this.snrTargetScreen!.setTargetParams(
            flightObject.identifier!,
            targetVisibilityK,
            targetSpotSize,
            targetOffsetX,
            targetOffsetY,
          );
          const targetSpotLength = (targetSpotSize +
            (this.distanceTrackingAccuracy * Math.random())) * rayWidth;

          // Draw point of missile hit
          const timeToHit = targetDistance /
            ((radialVelocity + this.missileVelocity) / 1000);
          const distanceToHit = (timeToHit * this.missileVelocity) / 1000;
          this.snrDistanceScreen!.setTargetParams(
            flightObject.identifier!,
            targetVisibilityK,
            targetOffsetX,
            targetDistance,
            targetSpotSize,
            targetSpotLength,
            distanceToHit,
            targetParam,
          );
        } else {
          this.snrTargetScreen!.removeTarget(flightObject.identifier!);
          this.snrDistanceScreen!.removeTarget(flightObject.identifier!);
        }

        if (isCapturedByDirection) {
          if (
            targetVerticalAngle < this.minVerticalAngle * Math.PI / 180 ||
            targetVerticalAngle > this.maxVerticalAngle * Math.PI / 180
          ) {
            this.resetCaptureTargetByDirection();
            this.resetCaptureTargetByDistance();
          }
          this.azimut = targetAzimutAngle;
          this.verticalAngle = targetVerticalAngle;
        }

        if (isCapturedByDistance) {
          if (
            targetDistance > this.maxDistance
          ) {
            this.resetCaptureTargetByDirection();
            this.resetCaptureTargetByDistance();
          }

          this.targetDistance = targetDistance;
          this.snrDistanceScreen!.setDistance(targetDistance);
        }

        if (
          isCapturedByDirection &&
          isCapturedByDistance &&
          this.eventListener
        ) {
          this.eventListener("targetVelocity", flightObject.velocity);
          this.eventListener(
            "targetHeight",
            flightObject.currentPoint.z,
          );
          this.eventListener("targetParam", targetParam);
        }
      } else if (
        flightObject.isDestroyed
      ) {
        if (
          this.trackingDirectionTargetIdentifier === flightObject.identifier
        ) {
          this.resetCaptureTargetByDirection();
          this.resetCaptureTargetByDistance();
        }

        this.snrTargetScreen!.removeTarget(flightObject.identifier!);
        this.snrDistanceScreen!.removeTarget(flightObject.identifier!);
        this.socScreen?.removeTarget(flightObject.identifier!);
      }
    }
  }

  captureTargetByDirection() {
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
      // Angle of ray of SNR
      const rayWidthRad = this.rayWidth * Math.PI / 180;
      const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);
      // Azimut of target spot
      const targetSpotAngle = ((2 * Math.sqrt(flightObject.rcs / Math.PI) /
        1000) /
        targetDistance) / rayWidth;

      const isCapturedByAzimut = Math.abs(this.azimut - targetAzimutAngle) <
        Math.abs(targetSpotAngle) * 2;

      // Difference from SNR and target heights
      const targetHeightOffset = flightObject.currentPoint.z -
        this.radarHeight / 1000;
      // Vertical angle from SNR to target
      const targetVerticalAngle = (targetHeightOffset / targetDistance);
      const isCapturedByVerticalAngle =
        Math.abs(this.verticalAngle - targetVerticalAngle) <
          Math.abs(targetSpotAngle);
      if (isCapturedByAzimut && isCapturedByVerticalAngle) {
        this.trackingDirectionTargetIdentifier = flightObject.identifier!;

        this.eventListener &&
          this.eventListener("isCapturedByDirection", true);
      }
    });
  }

  resetCaptureTargetByDirection() {
    Sounds.click();
    this.trackingDirectionTargetIdentifier = null;
    this.eventListener && this.eventListener("isCapturedByDirection", false);
    this.missiles.forEach((missile) => missile.destroyMissile());
    this.resetCaptureTargetByDistance();
  }

  get indicatorTargetDistance() {
    return this.targetDistance;
  }

  setIndicatorTargetDistance(distance: number) {
    if (distance > 0 && distance < this.maxDistance) {
      this.targetDistance = distance;
      this.snrDistanceScreen?.setDistance(distance);
    }
  }

  captureTargetByDistance() {
    Sounds.click();
    this.flightObjects.forEach((flightObject) => {
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      if (
        Math.abs(targetDistance - this.targetDistance) <
          this.distanceDetectRange &&
        this.trackingDirectionTargetIdentifier === flightObject.identifier
      ) {
        this.trackingDistanceTargetIdentifier = flightObject.identifier!;
        this.snrDistanceScreen!.setTrackingTargetByDistance(
          flightObject.identifier!,
        );
        this.eventListener &&
          this.eventListener("isCapturedByDistance", true);
      }
    });
  }

  resetCaptureTargetByDistance() {
    Sounds.click();
    this.trackingDistanceTargetIdentifier = null;
    this.snrDistanceScreen!.setTrackingTargetByDistance(null);
    this.eventListener && this.eventListener("isCapturedByDistance", false);
  }

  addMissile(missile: SAMissile) {
    this.missiles.push(missile);
  }

  private calculateMissiles() {
    for (let missile of this.missiles) {
      if (!missile.isDestroyedMissile) {
        // Distance from SNR to missile
        const missileDistance = Math.hypot(
          missile.missileCurrentPoint.x,
          missile.missileCurrentPoint.y,
        );
        // Azimut from SNR to target
        const missileAzimutAngle = Math.atan2(
          missile.missileCurrentPoint.y,
          missile.missileCurrentPoint.x,
        );
        // Difference from SNR and target heights
        const missileHeightOffset = missile.missileCurrentPoint.z -
          this.radarHeight / 1000;
        // Vertical angle from SNR to target
        const missileVerticalAngle = (missileHeightOffset / missileDistance);

        // Angle of ray of SNR
        const rayWidthRad = this.rayWidth * Math.PI / 180;
        // Difference of SNR azimut and target azimut
        const missileAzimutOffset = this.azimut - missileAzimutAngle;
        // Difference of SNR vertical angle and target vertical angle
        const missileVerticalOffset = missileVerticalAngle -
          this.verticalAngle;

        // Calculate missile offsets
        const missileOffsetX = -(missileAzimutOffset / rayWidthRad * 2);
        const missileOffsetY = -(missileVerticalOffset / rayWidthRad * 2);
        this.snrTargetScreen?.setMissileParams(
          missile.indentifier!,
          missileOffsetX,
          missileOffsetY,
        );
        this.snrDistanceScreen?.setMissileParams(
          missile.indentifier!,
          missileDistance,
        );
      } else {
        this.snrTargetScreen?.removeMissile(missile.indentifier!);
        this.snrDistanceScreen?.removeMissile(missile.indentifier!);
      }
    }
  }
}
