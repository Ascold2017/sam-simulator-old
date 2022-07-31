interface IPoint {
  x: number;
  y: number;
  z: number;
  v: number;
}
export default class FlightObject {
  private _identifier: string | null = null;
  private points: IPoint[] = [];
  private launchTime = 0;
  private timeInAir = 0;
  private flightTime = 0;
  private interval: number | null = null;
  private _isLaunched = false;
  private _isDestroyed = false;
  private _isKilled = false;
  private _currentPoint = { x: 0, y: 0, z: 0, v: 0 };
  private _currentRotation = 0; // rad
  private _rcs = 0.5;
  constructor(
    {
      identifier,
      points,
      rcs = 0.5,
    }: {
      identifier: string;
      points: IPoint[];
      rcs?: number;
    },
  ) {
    this._identifier = identifier;
    this._rcs = rcs;
    this.points = points;
    this.flightTime = this.getFlightTime();
  }

  get identifier() {
    return this._identifier;
  }

  get velocity() {
    return this._currentPoint.v;
  }

  get isLaunched() {
    return this._isLaunched;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get isKilled() {
    return this._isKilled;
  }

  get currentPoint() {
    return this._currentPoint;
  }

  get currentRotation() {
    return this._currentRotation;
  }

  get currentRotationDeg() {
    const azimut = (this._currentRotation + Math.PI / 2) * (180 / Math.PI);
    return azimut < 0 ? azimut + 360 : azimut;
  }

  get rcs() {
    return this._rcs;
  }

  launch() {
    this._isLaunched = true;
    this.launchTime = +new Date();
    
    console.log(`Flight object launched at ${new Date(this.launchTime)}`);
    this.interval = setInterval(() => {
      this.timeInAir = +new Date() - this.launchTime;
      const prevPoint = { ...this._currentPoint };
      this._currentPoint = this.getPositionAtTime();
      this._currentRotation = Math.atan2(
        this._currentPoint.y - prevPoint.y,
        this._currentPoint.x - prevPoint.x,
      );
     
      if (this.timeInAir >= this.flightTime) {
        this.destroy();
      }
    }, 0);
    return this;
  }

  destroy() {
    clearInterval(this.interval!);
    this.interval = null;
    this._isDestroyed = true;
  }

  kill() {
    this._isKilled = true;
    this.destroy();
  }

  getFlightTime() {
    return this.points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const distance = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      const timeMs = ((distance * 1000) / prevPoint.v) * 1000;
      return acc + timeMs;
    }, 0);
  }

  getPositionAtTime() {
    let totalTime = 0;
    for (let i = 0; i < this.points.length; i++) {
      const currentPoint = this.points[i];
      const prevPoint = i === 0 ? currentPoint : this.points[i - 1];
      const distance = Math.hypot(
        currentPoint.x - prevPoint.x,
        currentPoint.y - prevPoint.y,
      );
      const flightTime = ((distance * 1000) / prevPoint.v) * 1000;
      totalTime += flightTime;
      // If next real point finded - current point is next point
      if (totalTime >= this.timeInAir) {
        
        const distanceToNextPointK = 1 -
          ((totalTime - this.timeInAir) / totalTime);
        return this.getPositionBetweenPoints(
          prevPoint,
          currentPoint,
          distanceToNextPointK,
        );
      }
    }
    return this._currentPoint;
  }

  getPositionBetweenPoints(currentPoint: IPoint, nextPoint: IPoint, K: number) {
    return {
      x: currentPoint.x - (currentPoint.x - nextPoint.x) * K,
      y: currentPoint.y - (currentPoint.y - nextPoint.y) * K,
      z: currentPoint.z - (currentPoint.z - nextPoint.z) * K,
      v: currentPoint.v
    };
  }
}
