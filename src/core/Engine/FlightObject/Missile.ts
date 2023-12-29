import SAM_PARAMS from "@/const/SAM_PARAMS";
import type Engine from "../Engine";
import Vector3D from "../../Vector3D";
import BaseFlightObject from "./BaseFlightObject";
import type Enemy from "./Enemy";

type GuidanceMethod = '3P' | '1/2'

export default class Missile extends BaseFlightObject {
  private readonly target: Enemy;
  private readonly velocity;
  private readonly maxDistance;
  private readonly killRadius;
  private traveledDistance = 0;
  private method: GuidanceMethod;
  constructor(
    engine: Engine,
    target: Enemy,
    method: GuidanceMethod
  ) {
    const name = `Missile-${+new Date()}`
    super(engine, name, 1);
    this.target = target;
    this.maxDistance = SAM_PARAMS.MISSILE_MAX_DISTANCE;
    this.killRadius = SAM_PARAMS.MISSILE_KILL_RADIUS;
    this.velocity = SAM_PARAMS.MISSILE_VELOCITY;
    this.method = method;
  }

  update(time: number): void {
    const dTime = (time - this.timeInAir);
    super.update(time);
    if (!this.target) return this.destroy();
    const dFlightDistance = dTime * this.velocity;
    this.traveledDistance += dFlightDistance;

    const targetVector = new Vector3D(this.target.getCurrentPoint());
    const prevMissileVector = new Vector3D({ ...this.currentPoint })
    const targetDistance = targetVector.sub(prevMissileVector).r() as number;
    const currentPosition = this.calcMissilePosition3P(targetVector, prevMissileVector, targetDistance, dFlightDistance);;
    this.currentPoint = {
      x: currentPosition.x() as number,
      y: currentPosition.y() as number,
      z: currentPosition.z() as number,
      v: this.velocity,
    }

    if (targetDistance <= this.killRadius) {
      this.target.kill();
      this.destroy();
      return;
    }
    if (
      this.traveledDistance >= this.maxDistance
    ) {
      this.destroy();
      return;
    }
  }

  private calcMissilePosition3P(targetVector: Vector3D, prevMissileVector: Vector3D, targetDistance: number, dFlightDistance: number) {
    const distance = dFlightDistance < targetDistance
      ? dFlightDistance
      : targetDistance;
    // https://qna.habr.com/q/1189118
    const a = targetVector.dot(targetVector);
    const b = -2 * prevMissileVector.dot(targetVector);
    const c = prevMissileVector.dot(prevMissileVector) - distance ** 2;
    const d = b ** 2 - 4 * a * c;
    const sqrt = Math.sqrt(d >= 0 ? d : 0);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);
    return targetVector.scale(t1 > t2 ? t1 : t2);
  }

  private calcMissilePosition12(targetVector: Vector3D, prevMissileVector: Vector3D, targetDistance: number, dFlightDistance: number) {
    const distance = dFlightDistance < targetDistance
      ? dFlightDistance
      : targetDistance;
    
    return new Vector3D({ x: 0, y: 0, z: 0})
  }
}