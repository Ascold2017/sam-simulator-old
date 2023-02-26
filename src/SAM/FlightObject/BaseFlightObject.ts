import type { IPoint } from "../Engine";
import type Engine from "../Engine";

export default class BaseFlightObject {
    readonly name: string;
    protected currentPoint: IPoint = { x: 0, y: 0, z: 0, v: 0 };
    protected isDestroyed = false;
    protected timeInAir = 0;
    protected readonly engine: Engine;
    constructor(engine: Engine, name: string) {
      this.name = name;
      this.engine = engine;
    }
  
    getCurrentPoint() {
      return { ...this.currentPoint };
    }
    
    update(time: number) {
      this.timeInAir = time;
    }
  
    destroy() {
      this.engine.removeFlightObject(this.name!);
    }
  }