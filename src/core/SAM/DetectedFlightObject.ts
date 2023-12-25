import SAM_PARAMS from "@/const/SAM_PARAMS";
import type BaseFlightObject from "../Engine/FlightObject/BaseFlightObject";
import Missile from "../Engine/FlightObject/Missile";

export default class DetectedFlightObject {
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

    public isMissile: boolean;
    private flightObject: BaseFlightObject;
    constructor(flightObject: BaseFlightObject) {
        this.flightObject = flightObject;
        this.id = flightObject.id;
        const distance = this.getDistance();
        this.distance = distance;
        const azimuth = this.getAzimuth();
        this.azimuth = azimuth < 0 ? 2 * Math.PI + azimuth : azimuth;
        this.elevation = this.getTargetElevation(distance);
        this.velocity = flightObject.getCurrentPoint().v;
        this.radialVelocity = this.getRadialVelocity(azimuth);
        this.height = flightObject.getCurrentPoint().z;
        this.param = this.getTargetParam(azimuth, distance);
        this.x = flightObject.getCurrentPoint().x;
        this.y = flightObject.getCurrentPoint().y;
        this.rotation = flightObject.getCurrentRotation();
        this.size = 2 * Math.sqrt(flightObject.visibilityK / Math.PI);
        this.visibilityK = flightObject.visibilityK > 1 ? 1 : flightObject.visibilityK;

        const inAllowedElevation = this.elevation > SAM_PARAMS.MIN_ELEVATION && this.elevation < SAM_PARAMS.MAX_ELEVATION;
        this.isVisible = this.isInVision(distance) && inAllowedElevation && distance < SAM_PARAMS.MAX_DISTANCE;

        this.isMissile = flightObject instanceof Missile;
    }

    public getFlightObject(): BaseFlightObject {
        return this.flightObject;
    }

    private isInVision(distance: number) {

        const height = this.flightObject.getCurrentPoint().z;
        return Math.sqrt(2 * 6371009 * SAM_PARAMS.RADAR_HEIGHT) + Math.sqrt(2 * 6371009 * height) > distance;

    }

    private getDistance() {
        const currentPoint = this.flightObject.getCurrentPoint();
        return Math.hypot(currentPoint.x, currentPoint.y);
    }

    private getAzimuth() {
        const currentPoint = this.flightObject.getCurrentPoint();
        return Math.atan2(currentPoint.y, currentPoint.x);
    }

    private getTargetElevation(distance: number) {
        const targetHeightOffset = this.flightObject.getCurrentPoint().z - SAM_PARAMS.RADAR_HEIGHT;
        // Vertical angle from SNR to target
        return (targetHeightOffset / distance);
    }

    private getRadialVelocity(targetAzimuth: number) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > this.flightObject.getCurrentRotation()
            ? targetAzimuth - this.flightObject.getCurrentRotation()
            : this.flightObject.getCurrentRotation() - targetAzimuth) - Math.PI;

        // Radial velocity
        return this.flightObject.getCurrentPoint().v * Math.cos(targetAngle);
    }

    private getTargetParam(targetAzimuth: number, targetDistance: number) {
        // Angle between azimut to flight object and rotation of flight object
        const targetAngle = (targetAzimuth > this.flightObject.getCurrentRotation()
            ? targetAzimuth - this.flightObject.getCurrentRotation()
            : this.flightObject.getCurrentRotation() - targetAzimuth) - Math.PI;
        return Math.abs(targetDistance * Math.tan(targetAngle));
    }
}