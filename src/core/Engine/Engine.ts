import type BaseFlightObject from "./FlightObject/BaseFlightObject";
import Enemy from "./FlightObject/Enemy";
import LoopEngine from "./LoopEngine/LoopEngine";

export interface IPoint {
    x: number;
    y: number;
    z: number;
    v: number;
}
export interface IMission {
    identifier: string;
    points: IPoint[];
    rcs: number;
}

export default class Engine extends LoopEngine {
    private flightObjects: BaseFlightObject[] = [];
    constructor () {
        super();
    }

    public startMission(missions: IMission[]) {
        missions.forEach(mission => this.addFlightObject(new Enemy(this, mission.identifier, mission.points, mission.rcs, false)))
    }

    public addFlightObject(flightObject: BaseFlightObject) {
        this.flightObjects.push(flightObject);
        this.addFPSLoop(flightObject.id, (delta) => flightObject.update(delta), 100);
    }

    public removeFlightObject(id: string) {
        this.removeLoop(id);
        this.flightObjects = this.flightObjects.filter(fo => fo.id !== id);
    }

    public getFlightObjects(): BaseFlightObject[] {
        return this.flightObjects.slice(0);
    }
}