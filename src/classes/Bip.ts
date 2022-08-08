import type FlightObject from "./FlightObject";
interface IBip {
  canvasBip: HTMLCanvasElement;
}
export default class Bip {
  private flightObjects: FlightObject[] = [];
  private scale = 2;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private wayPoints: Record<string, { x: number; y: number }[]> = {};
  constructor({ canvasBip }: IBip) {
    this.ctx = canvasBip.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    this._draw();
  }

  _draw() {
    const acc = (window as any).__ACCELERATION__;
    this._drawSite();
    this.flightObjects.map((flightObject) =>
      this.drawFlightObjectWay(flightObject)
    );
    setInterval(() => {
      this.flightObjects.map((flightObject) =>
        this.drawFlightObjectWay(flightObject)
      );
    }, 10000 / acc);
  }

  _drawSite() {
    if (!this.ctx) return;
    this.ctx!.strokeStyle = "red";

    // Draw 25 km circle killzone
    this.ctx!.beginPath();
    this.ctx!.arc(
      this.canvasCenter.x,
      this.canvasCenter.y,
      25 * this.scale,
      0,
      2 * Math.PI,
    );
    this.ctx!.stroke();

    this.ctx!.strokeStyle = "white";
    this.ctx!.fillStyle = "white";
    this.ctx.font = "14px Russo One, sans-serif";
    const intToChar = (int: number) => String.fromCharCode(int + 65);
    // Draw rects
    for (let i = 1; i <= 10; i++) {
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, (i * 50) * this.scale);
      this.ctx.lineTo(this.ctx.canvas.width, (i * 50) * this.scale);
      this.ctx.stroke();
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo((i * 50) * this.scale, 0);
      this.ctx.lineTo((i * 50) * this.scale, this.ctx.canvas.height);
      this.ctx.stroke();
      // Legend
      this.ctx.fillText(intToChar(i - 1), 5, ((i - 1) * 50) * this.scale + 15);
      this.ctx.fillText(String(i - 1), (i * 50) * this.scale - 15, 15);
    }
  }

  private getCanvasCoordinates(point: any) {
    return {
      x: point.x * this.scale + this.canvasCenter.x,
      y: point.y * this.scale + this.canvasCenter.y,
    };
  }

  private drawFlightObjectWay(flightObject: FlightObject) {
    if (!flightObject.isLaunched) return;

    const wayPoints = this.wayPoints[flightObject.identifier!];
    const prevPoint = wayPoints.length >= 1
      ? wayPoints[wayPoints.length - 1]
      : flightObject.currentPoint;
    const heightText = (new Array(3).join("0") +
      Number(flightObject.currentPoint.z * 10).toFixed(0)).slice(-3);

    const prevCanvasPoint = this.getCanvasCoordinates(prevPoint);
    const currentCanvasPoint = this.getCanvasCoordinates(
      flightObject.currentPoint,
    );
    this.wayPoints[flightObject.identifier!].push(flightObject.currentPoint);
    // draw way
    this.ctx!.beginPath();
    this.ctx!.moveTo(prevCanvasPoint.x, prevCanvasPoint.y);
    this.ctx!.strokeStyle = "goldenrod";
    this.ctx!.fillStyle = "goldenrod";
    this.ctx!.font = "12px Russo One, sans-serif";
    this.ctx!.lineTo(currentCanvasPoint.x, currentCanvasPoint.y);
    this.ctx!.stroke();
    this.ctx!.beginPath();
    this.ctx?.arc(
      currentCanvasPoint.x,
      currentCanvasPoint.y,
      1,
      0,
      Math.PI * 2,
    );
    this.ctx?.fill();

    if (!flightObject.isDestroyed) {
      // Redrawing height
      const firstPoint = this.getCanvasCoordinates(wayPoints[0]);
      this.ctx!.beginPath();
      this.ctx!.clearRect(
        firstPoint.x + 10,
        firstPoint.y - 25,
        30,
        15,
      );
      this.ctx!.fillStyle = "goldenrod";
      this.ctx!.font = "14px Russo One, sans-serif";
      this.ctx!.fillText(
        String(heightText),
        firstPoint.x + 10,
        firstPoint.y - 10,
      );
    } else {
      // Drawing ending cross
      this.ctx!.strokeStyle = flightObject.isKilled ? "white" : "red";
      this.ctx!.beginPath();

      this.ctx!.moveTo(
        currentCanvasPoint.x - 10,
        currentCanvasPoint.y - 10,
      );
      this.ctx!.lineTo(
        currentCanvasPoint.x + 10,
        currentCanvasPoint.y + 10,
      );

      this.ctx!.moveTo(
        currentCanvasPoint.x + 10,
        currentCanvasPoint.y - 10,
      );
      this.ctx!.lineTo(
        currentCanvasPoint.x - 10,
        currentCanvasPoint.y + 10,
      );
      this.ctx!.stroke();
      // Remove flight object
      this.flightObjects = this.flightObjects.filter((fo) =>
        fo.identifier !== flightObject.identifier
      );
      delete this.wayPoints[flightObject.identifier!];
    }
  }

  private drawFlightObjectStartPoint(flightObject: FlightObject) {
    const currentCanvasPoint = this.getCanvasCoordinates(
      flightObject.currentPoint,
    );

    this.ctx!.fillStyle = "goldenrod";
    this.ctx!.strokeStyle = "goldenrod";
    // draw legend
    this.ctx!.beginPath();
    this.ctx!.moveTo(
      currentCanvasPoint.x,
      currentCanvasPoint.y - 20,
    );
    this.ctx!.lineTo(
      currentCanvasPoint.x,
      currentCanvasPoint.y + 20,
    );

    this.ctx!.stroke();
    this.ctx!.moveTo(currentCanvasPoint.x, currentCanvasPoint.y);
    this.ctx!.lineTo(
      currentCanvasPoint.x + 50,
      currentCanvasPoint.y,
    );
    this.ctx!.stroke();
    // Number of target
    const numberOfTargetText = (new Array(2).join("0") +
      Number(Object.keys(this.wayPoints).length).toFixed(0)).slice(-2);
    this.ctx!.font = "16px Russo One, sans-serif";
    this.ctx!.fillText(
      `24${numberOfTargetText}`,
      currentCanvasPoint.x - 40,
      currentCanvasPoint.y,
    );

    // Height of target
    this.ctx!.font = "14px Russo One, sans-serif";
    const heightText = (new Array(3).join("0") +
      Number(flightObject.currentPoint.z * 10).toFixed(0)).slice(-3);
    this.ctx!.fillText(
      String(heightText),
      currentCanvasPoint.x + 10,
      currentCanvasPoint.y - 10,
    );
    this.ctx!.fillText(
      "81",
      currentCanvasPoint.x + 10,
      currentCanvasPoint.y + 15,
    );
    this.wayPoints[flightObject.identifier!].push({
      x: flightObject.currentPoint.x,
      y: flightObject.currentPoint.y,
    });
  }

  addFlightObject(flightObject: FlightObject) {
    const int = setTimeout(() => {
      this.wayPoints[flightObject.identifier!] = [];
      this.flightObjects.push(flightObject);
      this.drawFlightObjectStartPoint(flightObject);
      clearTimeout(int);
    });
  }
}
