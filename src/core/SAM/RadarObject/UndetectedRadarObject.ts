import type BaseFlightObject from "@/core/Engine/FlightObject/BaseFlightObject";
import BaseRadarObject from "./BaseRadarObject";

export default class UndetectedRadarObject extends BaseRadarObject {
    constructor(flightObject: BaseFlightObject) {
        super({
            id: flightObject.id,
            currentPoint: flightObject.getCurrentPoint(),
            currentRotation: flightObject.getCurrentRotation(),
            visibilityK: flightObject.visibilityK * 2 * Math.random()
        });
    }
}