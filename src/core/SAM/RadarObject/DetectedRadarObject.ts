import type BaseFlightObject from "../../Engine/FlightObject/BaseFlightObject";
import Missile from "../../Engine/FlightObject/Missile";
import BaseRadarObject from "./BaseRadarObject";

export default class DetectedRadarObject extends BaseRadarObject {
    public isMissile: boolean;
    private flightObject: BaseFlightObject;
    constructor(flightObject: BaseFlightObject) {
        super({
            id: flightObject.id,
            visibilityK: flightObject.visibilityK,
            currentPoint: flightObject.getCurrentPoint(),
            currentRotation: flightObject.getCurrentRotation()
        })
        this.flightObject = flightObject;
        this.isMissile = flightObject instanceof Missile;
    }

    public getFlightObject(): BaseFlightObject {
        return this.flightObject;
    }

    static sortByVisibilityComparator(enemy1: BaseFlightObject, enemy2: BaseFlightObject): number {
        return enemy1.visibilityK < enemy2.visibilityK ? 1 : -1;
    }
}