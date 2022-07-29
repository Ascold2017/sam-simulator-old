export default class FlightObject {
  private _identifier: string | null = null;
  private wayPoints: { x: number; y: number; z: number }[] = [];
  private _velocity = 0;
  private launchTime = 0;
  private timeInAir = 0;
  private flightTime = 0;
  private interval: number | null = null;
  private _isLaunched = false;
  private _isDestroyed = false;
  private _isKilled = false;
  private _currentPoint = { x: 0, y: 0, z: 0 };
  private _currentRotation = 0; // rad
  private _rcs = 0.5;
  constructor(
    {
      identifier = new Date().toString(),
      wayPoints = [],
      velocity = 100,
      rcs = 0.5,
    }: {
      identifier: string;
      wayPoints: { x: number; y: number; z: number }[];
      velocity: number;
      rcs?: number;
    },
  ) {
    this._identifier = identifier;
    this._rcs = rcs;
    this.wayPoints = wayPoints;
    this._velocity = velocity;
    let flightRange = this.getFlightRange();
    let flightTime = (flightRange * 1000) / velocity; // Time in seconds
    this.flightTime = flightTime * 1000; // time in milliseconds
    console.log(
      `Flight range: ${flightRange} km. Flight time: ${
        Math.round(flightTime / 60)
      } min. Velocity: ${velocity} m/s`,
    );
  }

  get identifier() {
    return this._identifier;
  }

  get velocity() {
    return this._velocity;
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
    return this._currentRotation
  }

  get rcs() {
    return this._rcs;
  }

  launch(listener: (arg0: string) => void) {
    this._isLaunched = true;
    this.launchTime = +new Date();

    console.log(`Flight object launched at ${new Date(this.launchTime)}`);
    listener(
      `Flight object launched at ${
        new Date(this.launchTime).toLocaleTimeString()
      }`,
    );
    this.interval = setInterval(() => {
      this.timeInAir = +new Date() - this.launchTime;
      const partOfFlyWay = this.timeInAir / this.flightTime;
      const prevPoint = {...this._currentPoint};
      this._currentPoint = this.getCubicBezierXYZatT(
        this.wayPoints[0],
        this.wayPoints[1],
        this.wayPoints[2],
        this.wayPoints[3],
        partOfFlyWay,
      );
      this._currentRotation =  Math.atan2(this._currentPoint.y - prevPoint.y, this._currentPoint.x - prevPoint.x)
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

  private getFlightRange() {
    return this.wayPoints.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      return acc + length;
    }, 0);
  }

  // Given the 4 control points on a Bezier curve
  // Get x,y at interval T along the curve (0<=T<=1)
  // The curve starts when T==0 and ends when T==1
  private getCubicBezierXYZatT(
    startPt: { x: any; y: any; z: any },
    controlPt1: { x: any; y: any; z: any },
    controlPt2: { x: any; y: any; z: any },
    endPt: { x: any; y: any; z: any },
    T: number,
  ) {
    return ({
      x: this.cubicN(T, startPt.x, controlPt1.x, controlPt2.x, endPt.x),
      y: this.cubicN(T, startPt.y, controlPt1.y, controlPt2.y, endPt.y),
      z: this.cubicN(T, startPt.z, controlPt1.z, controlPt2.z, endPt.z),
    });
  }

  // cubic helper formula
  private cubicN(T: number, a: number, b: number, c: number, d: number) {
    var t2 = T * T;
    var t3 = t2 * T;
    return a + (-a * 3 + T * (3 * a - a * T)) * T +
      (3 * b + T * (-6 * b + b * 3 * T)) * T + (c * 3 - c * 3 * T) * t2 +
      d * t3;
  }
}
