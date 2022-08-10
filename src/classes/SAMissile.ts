import type FlightObject from "./FlightObject";
import Sounds from "./Sounds";

export default class SAMissile {
  private _identifier: string | null = null;
  private targetPosition = { x: 0, y: 0, z: 0 };
  private targetDistance = Infinity;
  private maxDistance: number = 0;
  private _velocity: number = 0;
  private interval: number | null = null;
  private currentPoint: { x: number; y: number; z: number } = {
    x: 0,
    y: 0,
    z: 0,
  };
  private currentRotation = 0;
  private launchTime: number = 0;
  private killRadius: number = 0.05; // 50 meters
  private isDestroyed = false;
  private traveledDistance = 0;
  constructor(
    maxDistance = 25,
    velocity = 900,
    initialPoint = { x: 0, y: 0, z: 0 },
  ) {
    this._identifier = new Date().toString();
    this.maxDistance = maxDistance;
    this._velocity = velocity;
    this.currentPoint = initialPoint;
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

  public setTargetPosition(
    targetPosition: { x: number; y: number; z: number },
  ) {
    this.targetPosition = targetPosition;
  }

  public launch() {
    this.launchTime = +new Date();
    let timer = 0;
    Sounds.missileStart();
    // Запускаем рассчет текущей позиции ракеты
    this.interval = setInterval(() => {
      const vectorVelocity = Math.abs(Math.cos(this.currentRotation)) *
        this._velocity;
      // Время в воздухе с прошлого тика
      const acc = (window as any).__ACCELERATION__;
      const tt = +new Date() - this.launchTime;
      const dt = (tt - timer) * acc;
      timer = tt;
      const dFlightDistance = ((dt / 1000) * vectorVelocity) /
        1000;

      const dx = this.targetPosition.x - this.currentPoint.x;
      const dy = this.targetPosition.y - this.currentPoint.y;
      const dz = this.targetPosition.z - this.currentPoint.z;

      this.targetDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      //находим направляющий вектор до цели
      let dirX = (dx / this.targetDistance) * dFlightDistance;
      let dirY = (dy / this.targetDistance) * dFlightDistance;
      let dirZ = dz * dFlightDistance;

      this.currentRotation = Math.atan2(dirY, dirX) - this.currentRotation;
      // Получаем новые координаты ракеты
      this.currentPoint = {
        x: this.currentPoint.x + dirX,
        y: this.currentPoint.y + dirY,
        z: this.currentPoint.z + dirZ,
      };

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
