import type FlightObject from "./FlightObject";

export default class SAMissile {
  private targetObject: FlightObject | null = null;
  private maxDistance: number = 0;
  private velocity: number = 0;
  private interval: number | null = null;
  private currentPoint: { x: number; y: number; z: number } = {
    x: 0,
    y: 0,
    z: 0,
  };
  private launchTime: number = 0;
  private timeInAir: number = 0;
  private killRadius: number = 0.05; // 50 meters
  private isDestroyed = false;
  constructor(
    targetObject: FlightObject,
    maxDistance = 25,
    velocity = 900,
    initialPoint = { x: 0, y: 0, z: 0 },
  ) {
    this.targetObject = targetObject;
    this.maxDistance = maxDistance;
    this.velocity = velocity;
    this.currentPoint = initialPoint;
  }

  public get isDestroyedMissile() {
    return this.isDestroyed;
  }

  public get missileCurrentPoint() {
    return {...this.currentPoint}
  }

  public launch() {
    if (!this.targetObject) return;
    this.launchTime = Date.now();
    // Запускаем рассчет текущей позиции ракеты
    this.interval = setInterval(() => {
      if (!this.targetObject) return;
      // Время в воздухе с прошлого тика
      const prevTime = this.timeInAir;
      this.timeInAir = (Date.now() - this.launchTime) / 1000;
      const targetPosition = this.targetObject.currentPoint;
      const flightDistance = (this.timeInAir * this.velocity) / 1000;
      // Пройденное расстояние с прошлого тика
      const dFlightDistance = ((this.timeInAir - prevTime) * this.velocity) /
        1000;

      const dx = targetPosition.x - this.currentPoint.x;
      const dy = targetPosition.y - this.currentPoint.y;
      const dz = targetPosition.z - this.currentPoint.z;
      // Пройденное растоянии
      const targetDistance = Math.sqrt(dx * dx + dy * dy);
      //находим направляющий вектор до цели
      let dirX = dx / targetDistance;
      let dirY = dy / targetDistance;
      let dirZ = dz * dFlightDistance;
      //умножаем направляющий вектор на необх длину
      dirX *= dFlightDistance;
      dirY *= dFlightDistance;
      // Получаем новые координаты ракеты
      this.currentPoint = {
        x: dirX + this.currentPoint.x,
        y: dirY + this.currentPoint.y,
        z: dirZ + this.currentPoint.z,
      };
      // Если цель в радиусе поражения
      if (targetDistance <= this.killRadius) {
        this.killFlightObject();
      }
      // Если превышена дальность полета или цель уничтожена
      if (
        flightDistance >= this.maxDistance || this.targetObject.isDestroyed
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

  private destroyMissile() {
    this.isDestroyed = true;
    clearInterval(this.interval!);
    this.interval = null;
  }
}
