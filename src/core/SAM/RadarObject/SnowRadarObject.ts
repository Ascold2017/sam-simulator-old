import SAM_PARAMS from "@/const/SAM_PARAMS";
import BaseRadarObject from "./BaseRadarObject";

export default class SnowRadarObject extends BaseRadarObject {
    constructor() {
        super({
            id: Math.random().toString(),
            currentPoint: {
                x: -(SAM_PARAMS.MAX_DISTANCE/2) + SAM_PARAMS.MAX_DISTANCE * Math.random(),
                y: -(SAM_PARAMS.MAX_DISTANCE/2) + SAM_PARAMS.MAX_DISTANCE * Math.random(),
                z: Math.random() * 100,
                v: Math.random() * 200
            },
            currentRotation: 2 * Math.PI * Math.random(),
            visibilityK: Math.random()
        });
    }
}