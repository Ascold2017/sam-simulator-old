import FlightObject from "./FlightObject";
const defaultParams = {
  altitude: 0.5,
  velocity: 280,
  time: 0,
};
interface IPoint {
  x: number;
  y: number;
  z: number;
  v: number;
}
interface IFlightMission {
  points: IPoint[];
  rcs: number;
  time: number;
  identifier: string;
}
export default class Editor {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private scale = 2;
  private _points: IPoint[] = [];
  private _rcs: number = 0.5;
  private _timeOffset: number = 0;
  private flightMissions: IFlightMission[] = [];
  private startingInterval: number | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.ctx = canvasElement.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    this._drawSite();
  }

  _drawSite() {
    if (!this.ctx) return;
    // Draw 25 km circle killzone
    this.ctx.strokeStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvasCenter.x,
      this.canvasCenter.y,
      25 * this.scale,
      0,
      2 * Math.PI,
    );
    this.ctx.stroke();
  }

  get points() {
    return this._points;
  }

  setParamAtPoint(index: number, paramName: string, paramValue: number) {
    this._points = this._points.map((point, i) => {
      if (i === index) {
        return { ...point, [paramName]: paramValue };
      }
      return point;
    });
  }

  get rcs(): number {
    return this._rcs;
  }

  set rcs(value: number) {
    this._rcs = value;
  }

  get timeOffset(): number {
    return this._timeOffset;
  }

  set timeOffset(value: number) {
    this._timeOffset = value;
  }

  get flightParams() {
    const range = this._points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      return acc + length;
    }, 0);
    const time = this._points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      const time = ((length * 1000) / prevPoint.v) / 60;
      return acc + time;
    }, 0);
    return { range: range.toFixed(1), time: time.toFixed(1) };
  }

  addPoint(event: MouseEvent) {
    if (!this.ctx) return;
    const canvasPoint = { x: event.offsetX, y: event.offsetY };
    const currentPoint = {
      x: (canvasPoint.x - this.canvasCenter.x) / this.scale,
      y: (canvasPoint.y - this.canvasCenter.y) / this.scale,
      z: defaultParams.altitude,
      v: defaultParams.velocity,
    };
    const prevPoint = this._points.length
      ? this._points[this._points.length - 1]
      : currentPoint;

    const prevCanvasPoint = {
      x: prevPoint.x * this.scale + this.canvasCenter.x,
      y: prevPoint.y * this.scale + this.canvasCenter.y,
    };
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.moveTo(prevCanvasPoint.x, prevCanvasPoint.y);
    this.ctx.lineTo(canvasPoint.x, canvasPoint.y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, 2 * Math.PI);
    this.ctx.fill();

    this._points.push(currentPoint);
  }

  reset() {
    this._points = [];
    this._rcs = 0.5;
    this._timeOffset = 0;
  }

  clear() {
    this.flightMissions = [];
    this.startingInterval && clearInterval(this.startingInterval);
    this.startingInterval = null;
    this.reset();
    this.ctx!.clearRect(
      0,
      0,
      this.ctx!.canvas.width,
      this.ctx!.canvas.height,
    );
    this._drawSite();
  }

  addFlightMission() {
    this.points[this.points.length - 1].z = 0;
    this.flightMissions.push({
      points: [...this.points],
      rcs: this._rcs,
      identifier: `----Flight object ${this.flightMissions.length + 1} -${Date.now()}----`,
      time: this._timeOffset,
    });

    this.reset();
  }

  exportFlightMissions() {
    console.log(btoa(JSON.stringify(this.flightMissions)));
  }
  importFlightMissions(string: string) {
    if (!string.length) return;
    this.flightMissions = JSON.parse(atob(string));
  }

  startFlightMissions(listener: (arg0: FlightObject) => void) {
    const startTime = Date.now();
    let flightMissions = [...this.flightMissions];
    this.clear();
    let currentTimeOffset = 0;
    let timer = 0
    this.startingInterval = setInterval(() => {
      const acc = (window as any).__ACCELERATION__;
      const tt = +new Date() - startTime;
      const dt = (tt - timer) * acc;
      currentTimeOffset += dt;
      timer = tt;
      flightMissions = flightMissions.filter((fm) => {
        if (currentTimeOffset / 1000 >= fm.time) {
          const flightObject = new FlightObject({
            identifier: fm.identifier,
            points: fm.points,
            rcs: fm.rcs,
          });
          listener(flightObject);
          return false;
        }
        return true;
      });
    });
  }
}
