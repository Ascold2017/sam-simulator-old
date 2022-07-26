import type FlightObject from "./FlightObject";
interface IBip {
  canvasBip: HTMLCanvasElement;
}
export default class Bip {
  _flightObjects: FlightObject[] = [];
  _scale = 2;
  _canvasContext: CanvasRenderingContext2D | null = null;
  _canvasCenter = { x: 0, y: 0 };
  _wayPoints: Record<string, { x: number; y: number }[]> = {};
  _messages: string[] = [];
  constructor({ canvasBip }: IBip) {
    this._canvasContext = canvasBip.getContext("2d");
    this._canvasCenter = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    this._draw();
  }

  _draw() {
    this._drawSite();
    this._flightObjects.map((flightObject) => this._drawFlightObjectWay(flightObject));
    setInterval(() => {
      this._flightObjects.map((flightObject) => this._drawFlightObjectWay(flightObject));
    }, 5000);
  }

  _drawSite() {
    const centerOfCanvas = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    this._canvasContext!.strokeStyle = "red";

    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      2,
      1,
      0,
    );
    this._canvasContext!.stroke();

    // Draw 25 km circle killzone
    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      25 * this._scale,
      0,
      2 * Math.PI,
    );
    this._canvasContext!.stroke();

    this._canvasContext!.strokeStyle = "white";

    // Draw 50 km circle
    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      50 * this._scale,
      0,
      2 * Math.PI,
    );
    this._canvasContext!.stroke();
    // Draw 100 km circle
    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      100 * this._scale,
      0,
      2 * Math.PI,
    );
    this._canvasContext!.stroke();
    // Draw 100 km circle
    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      150 * this._scale,
      0,
      2 * Math.PI,
    );
    this._canvasContext!.stroke();

    // Draw radial lines and degrees
    for (let deg = 0; deg < 360; deg += 5) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;
      const innerX = centerOfCanvas.x + (50 * this._scale) * Math.cos(radians);
      const innerY = centerOfCanvas.y + (50 * this._scale) * Math.sin(radians);
      const outerX = centerOfCanvas.x + (150 * this._scale) * Math.cos(radians);
      const outerY = centerOfCanvas.y + (150 * this._scale) * Math.sin(radians);

      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(innerX, innerY);
      this._canvasContext!.lineTo(outerX, outerY);
      this._canvasContext!.stroke();
    }
  }

  _getCanvasCoordinates(point: any) {
    return {
      x: point.x * this._scale + this._canvasCenter.x,
      y: point.y * this._scale + this._canvasCenter.y
    }
  }

  _drawFlightObjectWay(flightObject: FlightObject) {
    if (!flightObject.isLaunched) return;

    const wayPoints = this._wayPoints[flightObject.identifier!];
    const prevPoint = wayPoints.length >= 1
      ? wayPoints[wayPoints.length - 1]
      : flightObject.currentPoint;
    const heightText = flightObject.currentPoint.z < 10
      ? `0${Number(flightObject.currentPoint.z * 10).toFixed(0)}`
      : Number(flightObject.currentPoint.z * 10).toFixed(0);

    if (
      flightObject.isDestroyed && prevPoint.x === flightObject.currentPoint.x &&
      prevPoint.y === flightObject.currentPoint.y
    ) {
      return;
    }

    const prevCanvasPoint = this._getCanvasCoordinates(prevPoint);
    const currentCanvasPoint = this._getCanvasCoordinates(flightObject.currentPoint);
    if (wayPoints.length === 0) {
      this._canvasContext!.fillStyle = "white";
      this._canvasContext!.strokeStyle = "white";

      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(
        currentCanvasPoint.x,
        currentCanvasPoint.y - 20,
      );
      this._canvasContext!.lineTo(
        currentCanvasPoint.x,
        currentCanvasPoint.y + 20,
      );

      this._canvasContext!.stroke();
      this._canvasContext!.moveTo(currentCanvasPoint.x, currentCanvasPoint.y);
      this._canvasContext!.lineTo(
        currentCanvasPoint.x + 50,
        currentCanvasPoint.y,
      );
      this._canvasContext!.stroke();
      this._canvasContext!.font = "16px Arial";
      this._canvasContext!.fillText(
        "2401",
        currentCanvasPoint.x - 40,
        currentCanvasPoint.y,
      );
      this._canvasContext!.font = "14px Arial";

      this._canvasContext!.fillText(
        String(heightText),
        currentCanvasPoint.x + 10,
        currentCanvasPoint.y - 10,
      );
      this._canvasContext!.fillText(
        "81",
        currentCanvasPoint.x + 10,
        currentCanvasPoint.y + 15,
      );
    } else {
      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(prevCanvasPoint.x, prevCanvasPoint.y);
      this._canvasContext!.lineJoin = "miter";
      this._canvasContext!.strokeStyle = "white";
      this._canvasContext!.fillStyle = "white";
      this._canvasContext!.font = "12px Arial";
      this._canvasContext!.lineTo(currentCanvasPoint.x, currentCanvasPoint.y);
      this._canvasContext!.stroke();
      if (!flightObject.isDestroyed) {
        const firstPoint = this._getCanvasCoordinates(wayPoints[0]);
        this._canvasContext!.beginPath();
        this._canvasContext!.clearRect(
          firstPoint.x + 10,
          firstPoint.y - 25,
          30,
          15,
        );
        this._canvasContext!.font = "14px Arial";
        this._canvasContext!.fillText(
          String(heightText),
          firstPoint.x + 10,
          firstPoint.y - 10,
        );
      } else {
        this._canvasContext!.beginPath();

        this._canvasContext!.moveTo(
          currentCanvasPoint.x - 10,
          currentCanvasPoint.y - 10,
        );
        this._canvasContext!.lineTo(
          currentCanvasPoint.x + 10,
          currentCanvasPoint.y + 10,
        );

        this._canvasContext!.moveTo(
          currentCanvasPoint.x + 10,
          currentCanvasPoint.y - 10,
        );
        this._canvasContext!.lineTo(
          currentCanvasPoint.x - 10,
          currentCanvasPoint.y + 10,
        );
        this._canvasContext!.stroke();
      }
    }

    this._wayPoints[flightObject.identifier!].push(flightObject.currentPoint);
  }

  addFlightObject(flightObject: FlightObject) {
    this._wayPoints[flightObject.identifier!] = [];
    this._flightObjects.push(flightObject);
  }

  get messages() {
    return this._messages;
  }

  listener(message: string) {
    this._messages.push(message);
  }
}
