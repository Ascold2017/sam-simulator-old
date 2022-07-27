import FlightObject from "./FlightObject";

export default class Editor {
  _canvasContext: CanvasRenderingContext2D | null = null;
  _canvasCenter = { x: 0, y: 0 };
  _scale = 2;
  _points: { x: number; y: number; z: number }[] = [];
  _altitude = 0.5;
  _velocity: number = 280;
  _rcs: number = 0.5;
  constructor(canvasElement: HTMLCanvasElement) {
    this._canvasContext = canvasElement.getContext("2d");
    this._canvasCenter = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    this._drawSite();
  }

  _drawSite() {
    if (!this._canvasContext) return;
    // Draw 25 km circle killzone
    this._canvasContext.strokeStyle = "red";
    this._canvasContext.beginPath();
    this._canvasContext.arc(
      this._canvasCenter.x,
      this._canvasCenter.y,
      25 * this._scale,
      0,
      2 * Math.PI,
    );
    this._canvasContext.stroke();
  }

  get points() {
    return this._points;
  }

  get altitude() {
    return this._altitude;
  }

  set altitude(value) {
    this._altitude = value;
  }

  get velocity() {
    return this._velocity;
  }

  set velocity(value) {
    this._velocity = value;
  }

  get rcs() {
    return this._rcs;
  }

  set rcs(value) {
    this._rcs = value;
  }

  get flightParams() {
    const range = this._points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      return acc + length;
    }, 0);
    const time = Number((range * 1000) / this._velocity / 60).toFixed(1);
    return { range, time };
  }

  addPoint(event: MouseEvent) {
    if (!this._canvasContext) return;
    if (this._points.length >= 4) return;
    const canvasPoint = { x: event.offsetX, y: event.offsetY };
    const currentPoint = {
      x: (canvasPoint.x - this._canvasCenter.x) / this._scale,
      y: (canvasPoint.y - this._canvasCenter.y) / this._scale,
      z: 0,
    };
    const prevPoint = this._points.length
      ? this._points[this._points.length - 1]
      : currentPoint;

    const prevCanvasPoint = {
      x: prevPoint.x * this._scale + this._canvasCenter.x,
      y: prevPoint.y * this._scale + this._canvasCenter.y,
    };
    this._canvasContext.strokeStyle = "white";
    this._canvasContext.fillStyle = "white";
    this._canvasContext.beginPath();
    this._canvasContext.moveTo(prevCanvasPoint.x, prevCanvasPoint.y);
    this._canvasContext.lineTo(canvasPoint.x, canvasPoint.y);
    this._canvasContext.stroke();
    this._canvasContext.beginPath();
    this._canvasContext.arc(canvasPoint.x, canvasPoint.y, 3, 0, 2 * Math.PI);
    this._canvasContext.fill();

    this._points.push(currentPoint);
  }

  reset() {
    this._points = [];
    this._altitude = 0.5;
    this.velocity = 280;
    this.rcs = 0.5;
    this._canvasContext!.clearRect(
      0,
      0,
      this._canvasContext!.canvas.width,
      this._canvasContext!.canvas.height,
    );
    this._drawSite();
  }

  addFlightObject() {
    const wayPoints = [...this._points];
    wayPoints[1].z = this._altitude;
    wayPoints[2].z = this._altitude;
    const flightObject = new FlightObject({
      identifier: new Date().toString(),
      velocity: this._velocity,
      wayPoints: wayPoints,
      rcs: this._rcs,
    });

    this.reset();

    return flightObject;
  }
}
