import type { IPoint } from "../Engine";
import type Engine from "../Engine";
import BaseFlightObject from "./BaseFlightObject";

export default class Enemy extends BaseFlightObject {
    private points: IPoint[] = [];
    private currentPointIndex = 0;
    readonly visibilityK;
    readonly isUnion;
    private isKilled = false;
    private currentRotation = 0;
    constructor(engine: Engine, name: string, points: IPoint[], visibilityK: number, isUnion: boolean) {
      super(engine, name);
      this.points = [...points];
      this.visibilityK = visibilityK;
      this.isUnion = isUnion;
    }

    getCurrentRotation() {
      return this.currentRotation;
    }
  
    update(time: number) {
      super.update(time);
      if (this.currentPointIndex === this.points.length - 1) {
        return this.destroy();
      }
      const prevPoint = {...this.currentPoint}
      this.currentPoint = this.calcCurrentPoint();
      this.currentRotation = Math.atan2(
        this.currentPoint.y - prevPoint.y,
        this.currentPoint.x - prevPoint.x,
      );
    }
  
    private calcCurrentPoint() {
      const prevPoint = this.points[this.currentPointIndex];
      const nextPoint = this.points[this.currentPointIndex + 1];
      const flightTimeToCurrentPoint = this.getFlightTimeBetweenPoints(
        0,
        this.currentPointIndex,
      );
      const flightTimeToNextPoint = this.getFlightTimeBetweenPoints(
        this.currentPointIndex,
        this.currentPointIndex + 1,
      );
      const timeOverCurrentPoint = this.timeInAir - flightTimeToCurrentPoint;
      const K = timeOverCurrentPoint / flightTimeToNextPoint;
      if (
        timeOverCurrentPoint >= flightTimeToNextPoint
      ) {
        this.currentPointIndex++;
      }
      return this.getPositionBetweenPoints(
        prevPoint,
        nextPoint,
        K,
      );
    }

    private getFlightTimeBetweenPoints(fromIndex: number, toIndex: number) {
      const points = this.points.slice(fromIndex, toIndex + 1);
      return points.reduce((acc, point, index, points) => {
        const prevPoint = index === 0 ? point : points[index - 1];
        const distance = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
        const timeMs = ((distance * 1000) / prevPoint.v) * 1000;
        return acc + timeMs;
      }, 0);
    }
  
    private getPositionBetweenPoints(currentPoint: IPoint, nextPoint: IPoint, K: number) {
      return {
        x: currentPoint.x - (currentPoint.x - nextPoint.x) * K,
        y: currentPoint.y - (currentPoint.y - nextPoint.y) * K,
        z: currentPoint.z - (currentPoint.z - nextPoint.z) * K,
        v: currentPoint.v,
      };
    }
  
    kill() {
      this.isKilled = true;
      this.destroy();
    }
  }