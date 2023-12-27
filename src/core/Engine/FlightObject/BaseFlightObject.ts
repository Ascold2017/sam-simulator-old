import type { IPoint } from "../Engine";
import type Engine from "../Engine";

export default class BaseFlightObject {
    readonly id: string;
    // TODO make visibilityK dynamic
    public visibilityK: number;
    protected currentPoint: IPoint = { x: 0, y: 0, z: 0, v: 0 };
    protected currentRotation: number = 0;
    protected isDestroyed = false;
    protected timeInAir = 0;
    protected readonly engine: Engine;

    constructor(engine: Engine, id: string, visibilityK: number) {
      this.id = id;
      this.engine = engine;
      this.visibilityK = visibilityK;
    }
  
    getCurrentPoint() {
      return { ...this.currentPoint };
    }

    getCurrentRotation() {
      return this.currentRotation;
    }
    
    update(time: number) {
      this.timeInAir = time;
    }
  
    destroy() {
      this.isDestroyed = true;
      this.engine.removeFlightObject(this.id);
    }
  }