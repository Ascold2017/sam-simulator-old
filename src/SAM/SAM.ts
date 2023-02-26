import SAM_PARAMS from "@/const/SAM_PARAMS";
import Engine from "./Engine";
import type BaseFlightObject from "./FlightObject/BaseFlightObject";
import type Enemy from "./FlightObject/Enemy";

export interface IRecognizedFlightObjects {
    identifier: string;
    distance: number;
    azimuth: number;
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


export default class SAM {
   

    recaclulateRecognizedFlightObjects(flightObjects: Enemy[]) {
        const recognizedFlightObjects: IRecognizedFlightObjects[] = [];
        for (const flightObject of flightObjects) {

            // Distance from SNR to target
            const targetDistance = this.getDistance(flightObject);
            // Azimut from SNR to target
            const targetAzimuth = this.getAzimuth(flightObject);
            // Vertical angle from SNR to target
            const targetElevation = this.getTargetElevation(flightObject, targetDistance)
            // Radial velocity
            const radialVelocity = this.getRadialVelocity(flightObject, targetAzimuth);
            // Is visible from horizont
            const isTargetVisible = this.isInVision(flightObject, targetDistance);

            // Target param
            const targetParam = this.getTargetParam(flightObject, targetAzimuth, targetDistance);
            // Target size
            // Size in km; rcs converted to diameter of circle with same scale
            const targetSize = 2 * Math.sqrt(flightObject.visibilityK / Math.PI) / 1000;

            const inAllowedElevation = targetElevation > SAM_PARAMS.MIN_ELEVATION &&
                targetElevation < SAM_PARAMS.MAX_ELEVATION;

            const visibilityK = (SAM_PARAMS.MAX_DISTANCE * flightObject.visibilityK) / targetDistance;

            if (isTargetVisible && inAllowedElevation) {
                recognizedFlightObjects.push({
                    identifier: flightObject.name,
                    distance: targetDistance,
                    azimuth: targetAzimuth < 0
                        ? 2 * Math.PI + targetAzimuth
                        : targetAzimuth,
                    elevation: targetElevation,
                    radialVelocity,
                    velocity: flightObject.getCurrentPoint().v,
                    height: flightObject.getCurrentPoint().z,
                    param: targetParam,
                    x: flightObject.getCurrentPoint().x,
                    y: flightObject.getCurrentPoint().y,
                    rotation: flightObject.getCurrentRotation(),
                    size: targetSize,
                    visibilityK: visibilityK > 1 ? 1 : visibilityK
                });
            }
        }
        return recognizedFlightObjects;
    }

    private isInVision(flightObject: BaseFlightObject, distance: number) {
        const height = flightObject.getCurrentPoint().z;
        return Math.sqrt(2 * 6371.009 * SAM_PARAMS.RADAR_HEIGHT) +
            Math.sqrt(2 * 6371.009 * height) > distance;
    }
    private getDistance(flightObject: BaseFlightObject) {
        const currentPoint = flightObject.getCurrentPoint();
        return Math.hypot(
            currentPoint.x,
            currentPoint.y,
        );
    }
    private getAzimuth(flightObject: BaseFlightObject) {
        const currentPoint = flightObject.getCurrentPoint();
        return Math.atan2(
            currentPoint.y,
            currentPoint.x,
        );
    }
    private getTargetElevation(flightObject: BaseFlightObject, distance: number) {
        const targetHeightOffset = flightObject.getCurrentPoint().z -
            SAM_PARAMS.RADAR_HEIGHT;
        // Vertical angle from SNR to target
        return (targetHeightOffset / distance);
    }
    private getRadialVelocity(flightObject: Enemy, targetAzimuth: number) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > flightObject.getCurrentRotation()
            ? targetAzimuth - flightObject.getCurrentRotation()
            : flightObject.getCurrentRotation() - targetAzimuth) - Math.PI;

        // Radial velocity
        return flightObject.getCurrentPoint().v * Math.cos(targetAngle);
    }

    private getTargetParam(flightObject: Enemy, targetAzimuth: number, targetDistance: number) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > flightObject.getCurrentRotation()
            ? targetAzimuth - flightObject.getCurrentRotation()
            : flightObject.getCurrentRotation() - targetAzimuth) - Math.PI;
        return Math.abs(targetDistance * Math.tan(targetAngle));
    }
}