import type FlightObject from "./FlightObject";

export default class SAMissile {
  _targetObject: FlightObject | null = null;
  _maxDistance: number = 0;
  _velocity: number = 0;
  _interval: number | null = null;
  _currentPoint: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  _launchTime: number = 0;
  _timeInAir: number = 0;
  _explosionDistance: number = 0.05;
  isDestroyed = false;
  constructor(
    targetObject: FlightObject,
    maxDistance = 25,
    velocity = 900,
    initialPoint = { x: 0, y: 0, z: 0 },
  ) {
    this._targetObject = targetObject;
    this._maxDistance = maxDistance;
    this._velocity = velocity;
    this._currentPoint = initialPoint;
  }

  launch() {
    this._launchTime = Date.now();
    this._interval = setInterval(() => {
      const prevTime = this._timeInAir;
      this._timeInAir = (Date.now() - this._launchTime) / 1000;
      const targetPosition = this._targetObject!.currentPoint;
      const flightDistance = (this._timeInAir * this._velocity) / 1000;
      const dFlightDistance = ((this._timeInAir - prevTime) * this._velocity) /
        1000; // Расстояние с прошлого цикла
      //находим длину исходного отрезка
      const dx = targetPosition.x - this._currentPoint.x;
      const dy = targetPosition.y - this._currentPoint.y;
      const targetDistance = Math.sqrt(dx * dx + dy * dy);
      //находим направляющий вектор
      let dirX = dx / targetDistance;
      let dirY = dy / targetDistance;
      //умножаем направляющий вектор на необх длину
      dirX *= dFlightDistance;
      dirY *= dFlightDistance;
      this._currentPoint = {
        x: dirX + this._currentPoint.x,
        y: dirY + this._currentPoint.y,
        z: this._currentPoint.z,
      };
      if (targetDistance <= this._explosionDistance) {
        this._killFlightObject();
      }
      if (flightDistance >= this._maxDistance || this._targetObject!.isDestroyed) {
        this._destroyMissile();
      }
    }, 0);
  }

  _killFlightObject() {
    this.isDestroyed = true;
    clearInterval(this._interval!);
    this._interval = null;
    this._targetObject!.kill();
  }

  _destroyMissile() {
    this.isDestroyed = true;
    clearInterval(this._interval!);
    this._interval = null;
  }
}
