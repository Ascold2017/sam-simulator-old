import type FlightObject from "./FlightObject";
import Sounds from "./Sounds";
import Vector3d from '@/core/Vector3D'
export default class SAMissile {
  private _identifier: number | null = null;
  private target: FlightObject | null = null;
  private targetDistance = Infinity;
  private maxDistance: number = 0;
  private _velocity: number = 0;
  private interval: number | null = null;
  private currentPoint: { x: number; y: number; z: number } = {
    x: 0,
    y: 0,
    z: 0,
  };
  private launchTime: number = 0;
  private killRadius: number = 0.05; // 50 meters
  private isDestroyed = false;
  private traveledDistance = 0;
  constructor(
    id: number,
    maxDistance = 25,
    velocity = 900,
    initialPoint = { x: 0, y: 0, z: 0 },
    target: FlightObject
  ) {
    this._identifier = id;
    this.maxDistance = maxDistance;
    this._velocity = velocity;
    this.currentPoint = initialPoint;
    this.target = target
  }

  get identifier() {
    return this._identifier;
  }

  get velocity() {
    return this._velocity;
  }

  public get isDestroyedMissile() {
    return this.isDestroyed;
  }

  public get missileCurrentPoint() {
    return { ...this.currentPoint };
  }

  public get missileKillRadius() {
    return this.killRadius;
  }

  public get missileTargetDistance() {
    return this.targetDistance;
  }

  public launch() {
    this.launchTime = +new Date();
    let timer = 0;
    Sounds.missileStart();
    // Запускаем рассчет текущей позиции ракеты
    this.interval = setInterval(() => {
      // Время в воздухе с прошлого тика
      const acc = (window as any).__ACCELERATION__;
      const tt = +new Date() - this.launchTime;
      const dt = (tt - timer) * acc;
      timer = tt;
      const dFlightDistance = ((dt / 1000) * this._velocity) /
        1000;

      const targetVector = new Vector3d(this.target!.currentPoint);
      const prevMissileVector = new Vector3d(this.currentPoint);

      this.targetDistance = targetVector.sub(prevMissileVector).r() as number;

      const distance = dFlightDistance < this.targetDistance ? dFlightDistance : this.targetDistance;
      /* https://qna.habr.com/q/1189118 */
      const a = targetVector.dot(targetVector);
      const b = -2*prevMissileVector.dot(targetVector);
      const c = prevMissileVector.dot(prevMissileVector) - distance**2;
      const d = b**2 - 4*a*c;
      const t1 = (-b - Math.sqrt(d >= 0 ? d :  0))/(2*a);
      const t2 = (-b + Math.sqrt(d >= 0 ? d :  0))/(2*a);
      const nextMissileVector = targetVector.scale(t1 > t2 ? t1 : t2);

      this.currentPoint = nextMissileVector.xyz()

      this.traveledDistance += dFlightDistance;
      // Если превышена дальность полета или цель уничтожена
      if (
        this.traveledDistance >= this.maxDistance
      ) {
        this.destroyMissile();
      }
      
    }, 0);
  }

  destroyMissile() {
    this.isDestroyed = true;
    clearInterval(this.interval!);
    this.interval = null;
  }
}
