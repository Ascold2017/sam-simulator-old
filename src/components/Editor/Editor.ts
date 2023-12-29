import SAM_PARAMS from "@/const/SAM_PARAMS";
import FLIGHT_OBJECT_TYPES from "@/const/FLIGHT_OBJECT_TYPES";
import type { IPoint } from "@/core/Engine/Engine";

export interface IFlightMission {
  points: IPoint[];
  rcs: number;
  time: number;
  identifier: string;
  flightObjectTypeId: number;
}
export default class Editor {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private scale =  333;
  private points: IPoint[] = [];
  private timeOffset: number = 0;
  private flightMissions: IFlightMission[] = [];
  private startingInterval: number | null = null;
  private flightObjectTypeId: number | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.ctx = canvasElement.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    canvasElement.style.backgroundImage = `url(${SAM_PARAMS.IMAGE})`;
    this.drawSite();
  }

  static get flightObjectTypes() {
    return FLIGHT_OBJECT_TYPES;
  }

  private drawSite() {
    if (!this.ctx) return;
    // Draw 50 km circle killzone
    this.ctx.strokeStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvasCenter.x,
      this.canvasCenter.y,
      SAM_PARAMS.MISSILE_MAX_DISTANCE / (this.scale * 2),
      0,
      2 * Math.PI,
    );
    this.ctx.stroke();
  }

  public getPoints() {
    return this.points;
  }

  public getFlightObjectType() {
    return Editor.flightObjectTypes.find((fo) => fo.id === this.flightObjectTypeId);
  }

  public setFlightObjectType(id: number) {
    this.flightObjectTypeId = id;
  }

  public setParamAtPoint(index: number, paramName: string, paramValue: number) {
    this.points = this.points.map((point, i) => {
      if (i === index) {
        return { ...point, [paramName]: paramValue };
      }
      return point;
    });
  }

  getTimeOffset(): number {
    return this.timeOffset;
  }

  setTimeOffset(value: number) {
    this.timeOffset = value;
  }

  getFlightParams() {
    const range = this.points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      return acc + length;
    }, 0) / 1000;
    const time = this.points.reduce((acc, point, index, points) => {
      const prevPoint = index === 0 ? point : points[index - 1];
      const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
      const time = (length / prevPoint.v) / 60;
      return acc + time;
    }, 0);
    return { range: range.toFixed(1), time: time.toFixed(1) };
  }

  getFlightObjectMissions() {
    return this.flightMissions.map((fm) => ({
      id: fm.identifier,
      startFrom: fm.time,
      flightObjectTypeId: fm.flightObjectTypeId,
    }));
  }

  addPoint(event: MouseEvent) {
    if (!this.ctx) return;
    const canvasPoint = { x: event.offsetX, y: event.offsetY };
    console.log(canvasPoint)
    const currentPoint = {
      x: (canvasPoint.x - this.canvasCenter.x) * this.scale * 2,
      y: (canvasPoint.y - this.canvasCenter.y) * this.scale * 2,
      z: this.getFlightObjectType()!.altitude(),
      v: this.getFlightObjectType()!.maxVelocity,
    };
    const prevPoint = this.points.length
      ? this.points[this.points.length - 1]
      : currentPoint;

    const prevCanvasPoint = {
      x: prevPoint.x / this.scale / 2 + this.canvasCenter.x,
      y: prevPoint.y / this.scale / 2 + this.canvasCenter.y,
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

    this.points.push(currentPoint);
  }

  reset() {
    this.points = [];
    this.flightObjectTypeId = null;
    this.timeOffset = 0;
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
    this.drawSite();
  }

  addFlightMission() {
    this.points[this.points.length - 1].z = 0;
    this.flightMissions.push({
      flightObjectTypeId: this.flightObjectTypeId!,
      points: [
        ...this.points.map((p) => ({ x: p.x, y: p.y, z: +p.z, v: +p.v })),
      ],
      rcs: this.getFlightObjectType()!.rcs,
      identifier: `----Flight object ${
        this.flightMissions.length + 1
      }----`,
      time: this.timeOffset,
    });

    this.reset();
  }

  exportFlightMissions() {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;base64," +
        encodeURIComponent(btoa(JSON.stringify(this.flightMissions))),
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
      this.flightMissions = JSON.parse(reader.result as string);
    };
    reader.readAsText(file);
  }

  importFlightMissionsString(string: string) {
    this.flightMissions = JSON.parse(string);
  }

  getFlightMissions() {
    return  [...this.flightMissions];
  }
/*
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
  */
}
