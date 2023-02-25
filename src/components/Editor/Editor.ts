import FlightObject from "../../core/FlightObject";
import SAM_PARAMS from "@/const/SAM_PARAMS";
import FLIGHT_OBJECT_TYPES from "@/const/FLIGHT_OBJECT_TYPES";
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
  flightObjectTypeId: number;
}
export default class Editor {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private scale = 1.25;
  private _points: IPoint[] = [];
  private _timeOffset: number = 0;
  private _flightMissions: IFlightMission[] = [];
  private startingInterval: number | null = null;
  private flightObjectTypeId: number | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.ctx = canvasElement.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    canvasElement.style.backgroundImage = `url(${SAM_PARAMS.IMAGE})`;
    this._drawSite();
  }

  static get flightObjectTypes() {
    return FLIGHT_OBJECT_TYPES;
  }

  _drawSite() {
    if (!this.ctx) return;
    // Draw 50 km circle killzone
    this.ctx.strokeStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvasCenter.x,
      this.canvasCenter.y,
      50 * this.scale,
      0,
      2 * Math.PI,
    );
    this.ctx.stroke();
  }

  get points() {
    return this._points;
  }

  get flightObjectType() {
    return Editor.flightObjectTypes.find((fo) =>
      fo.id === this.flightObjectTypeId
    )!;
  }

  setFlightObjectType(id: number) {
    this.flightObjectTypeId = id;
  }

  setParamAtPoint(index: number, paramName: string, paramValue: number) {
    this._points = this._points.map((point, i) => {
      if (i === index) {
        return { ...point, [paramName]: paramValue };
      }
      return point;
    });
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

  get flightObjectMissions() {
    return this._flightMissions.map((fm) => ({
      id: fm.identifier,
      startFrom: fm.time,
      flightObjectTypeId: fm.flightObjectTypeId,
    }));
  }

  addPoint(event: MouseEvent) {
    if (!this.ctx) return;
    const canvasPoint = { x: event.offsetX, y: event.offsetY };
    const currentPoint = {
      x: (canvasPoint.x - this.canvasCenter.x) / this.scale,
      y: (canvasPoint.y - this.canvasCenter.y) / this.scale,
      z: this.flightObjectType.altitude(),
      v: this.flightObjectType.maxVelocity,
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
    this.flightObjectTypeId = null;
    this._timeOffset = 0;
  }

  clear() {
    this._flightMissions = [];
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
    this._flightMissions.push({
      flightObjectTypeId: this.flightObjectTypeId!,
      points: [
        ...this.points.map((p) => ({ x: p.x, y: p.y, z: +p.z, v: +p.v })),
      ],
      rcs: this.flightObjectType.rcs,
      identifier: `----Flight object ${
        this._flightMissions.length + 1
      } -${Date.now()}----`,
      time: this._timeOffset,
    });

    this.reset();
  }

  exportFlightMissions() {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;base64," +
        encodeURIComponent(btoa(JSON.stringify(this._flightMissions))),
    );
    element.setAttribute("download", "SAM-Mission.mission");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
  importFlightMissions(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this._flightMissions = JSON.parse(reader.result as string);
    };
    reader.readAsText(file);
  }

  importFlightMissionsString(string: string) {
    this._flightMissions = JSON.parse(string);
  }

  startFlightMissions(listener: (arg0: FlightObject) => void) {
    const startTime = Date.now();
    let flightMissions = [...this._flightMissions];
    this.clear();
    let currentTimeOffset = 0;
    let timer = 0;
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
