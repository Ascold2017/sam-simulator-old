import SAM_PARAMS from "@/const/SAM_PARAMS";
import type { IPoint } from "@/core/Engine/Engine";

interface BaseRadarObjectConstructor {
    id: string;
    currentPoint: IPoint;
    currentRotation: number;
    visibilityK: number;
}
export default class BaseRadarObject {
    public id: string;
    public distance: number;
    public azimuth: number;
    public elevation: number;
    public radialVelocity: number;
    public velocity: number;
    public height: number;
    public param: number;
    public x: number;
    public y: number;
    public rotation: number;
    public size: number;
    public visibilityK: number;
    public isVisible: boolean;

    constructor(payload: BaseRadarObjectConstructor) {
        this.id = payload.id;
        const distance = this.getDistance(payload.currentPoint);
        this.distance = distance;
        const azimuth = this.getAzimuth(payload.currentPoint);
        this.azimuth = azimuth < 0 ? 2 * Math.PI + azimuth : azimuth;
        this.elevation = this.getTargetElevation(distance, payload.currentPoint.z);
        this.velocity = payload.currentPoint.v;
        this.radialVelocity = this.getRadialVelocity(azimuth, payload.currentRotation, payload.currentPoint);
        this.height = payload.currentPoint.z;
        this.param = this.getTargetParam(azimuth, distance, payload.currentRotation);
        this.x = payload.currentPoint.x;
        this.y = payload.currentPoint.y;
        this.rotation = payload.currentRotation;
        this.size = 2 * Math.sqrt(payload.visibilityK / Math.PI);
        this.visibilityK = payload.visibilityK > 1 ? 1 : payload.visibilityK;

        const inAllowedElevation = this.elevation > SAM_PARAMS.MIN_ELEVATION && this.elevation < SAM_PARAMS.MAX_ELEVATION;
        this.isVisible = this.isInVision(distance, payload.currentPoint.z) && inAllowedElevation && distance < SAM_PARAMS.MAX_DISTANCE;
        
    }

    protected isInVision(distance: number, height: number) {
        return Math.sqrt(2 * 6371009 * SAM_PARAMS.RADAR_HEIGHT) + Math.sqrt(2 * 6371009 * height) > distance;
    }

    protected getDistance(currentPoint: IPoint) {
        return Math.hypot(currentPoint.x, currentPoint.y);
    }

    protected getAzimuth(currentPoint: IPoint) {
        return Math.atan2(currentPoint.y, currentPoint.x);
    }

    protected getTargetElevation(distance: number, height: number) {
        const targetHeightOffset = height - SAM_PARAMS.RADAR_HEIGHT;
        // Vertical angle from SNR to target
        return (targetHeightOffset / distance);
    }

    protected getRadialVelocity(targetAzimuth: number, currentRotation: number, currentPoint: IPoint) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > currentRotation
            ? targetAzimuth - currentRotation
            : currentRotation - targetAzimuth) - Math.PI;

        // Radial velocity
        return currentPoint.v * Math.cos(targetAngle);
    }

    protected getTargetParam(targetAzimuth: number, targetDistance: number, currentRotation: number) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > currentRotation
            ? targetAzimuth - currentRotation
            : currentRotation - targetAzimuth) - Math.PI;
        return Math.abs(targetDistance * Math.tan(targetAngle));
    }
   
}