import type FlightObject from "./FlightObject";

export default class SAMissile {
  private _identifier: string | null = null;
  private targetObject: FlightObject | null = null;
  private maxDistance: number = 0;
  private velocity: number = 0;
  private interval: number | null = null;
  currentPoint: { x: number; y: number; z: number } = {
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
    targetObject: FlightObject,
    maxDistance = 25,
    velocity = 900,
    initialPoint = { x: 0, y: 0, z: 0 },
  ) {
    this._identifier = new Date().toString();
    this.targetObject = targetObject;
    this.maxDistance = maxDistance;
    this.velocity = velocity;
    this.currentPoint = initialPoint;
  }

  get indentifier() {
    return this._identifier;
  }

  public get isDestroyedMissile() {
    return this.isDestroyed;
  }

  public get missileCurrentPoint() {
    return { ...this.currentPoint };
  }

  public launch() {
    if (!this.targetObject) return;
    this.launchTime = +new Date();
    let timer = 0;
    // Запускаем рассчет текущей позиции ракеты
    this.interval = setInterval(() => {
      if (!this.targetObject) return;
      const vectorVelocity = Math.abs(Math.cos(this.currentRotation)) * this.velocity;
      // Время в воздухе с прошлого тика
      const acc = (window as any).__ACCELERATION__;
      const tt = +new Date() - this.launchTime;
      const dt = (tt - timer) * acc;
      timer = tt;
      const dFlightDistance = ((dt / 1000) * vectorVelocity) /
        1000;
      const targetPosition = this.targetObject.currentPoint;

      const dx = targetPosition.x - this.currentPoint.x;
      const dy = targetPosition.y - this.currentPoint.y;
      const dz = targetPosition.z - this.currentPoint.z;

      const targetDistance = Math.sqrt(dx * dx + dy * dy);

      //находим направляющий вектор до цели
      let dirX = (dx / targetDistance) * dFlightDistance;
      let dirY = (dy / targetDistance) * dFlightDistance;
      let dirZ = dz * dFlightDistance;

      this.currentRotation = Math.atan2(dirY, dirX) - this.currentRotation;
      // Получаем новые координаты ракеты
      this.currentPoint = {
        x: this.currentPoint.x + dirX,
        y: this.currentPoint.y + dirY,
        z: this.currentPoint.z + dirZ,
      };

      // Если цель в радиусе поражения
      if (targetDistance <= this.killRadius) {
        this.killFlightObject();
      }
      this.traveledDistance += dFlightDistance;
      // Если превышена дальность полета или цель уничтожена
      if (
        this.traveledDistance >= this.maxDistance ||
        this.targetObject.isDestroyed
      ) {
        this.destroyMissile();
      }
    }, 0);
  }

  private killFlightObject() {
    this.isDestroyed = true;
    clearInterval(this.interval!);
    this.interval = null;
    this.targetObject!.kill();
  }

  destroyMissile() {
    this.isDestroyed = true;
    clearInterval(this.interval!);
    this.interval = null;
  }
}
