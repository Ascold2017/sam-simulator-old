import type FlightObject from "./FlightObject";
interface IRadar {
  scale?: number;
  canvasRadar: any;
  rayWidth?: number;
}
export default class Radar {
  _flightObjects: FlightObject[] = [];
  _scale = 1;
  _canvasContext: CanvasRenderingContext2D | null = null;
  _canvasCenter = { x: 0, y: 0 };
  _wayPoints: Record<string, { x: number; y: number }[]> = {};
  _rayWidth = 0;
  _maxLocateDistance = 150;
  radarHeight = 0.05;
  _targetRayAngle = 0;
  constructor({
    scale = 2,
    canvasRadar,
    rayWidth = 2, // in degrees
  }: IRadar) {
    this._canvasContext = canvasRadar.getContext("2d");
    this._canvasCenter = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    this._scale = scale;
    this._rayWidth = rayWidth;

    this._draw();
    this._cleanupWaypoints();
  }

  get scale() {
    return this._scale;
  }

  set scale(v: number) {
    this._scale = v;
  }

  get targetRayAngle() {
    return this._targetRayAngle * (180 / Math.PI);
  }

  set targetRayAngle(v: number) {
    this._targetRayAngle = v * Math.PI/180;
  }

  _cleanupWaypoints() {
    setInterval(() => {
      Object.keys(this._wayPoints).map((key) => {
        this._wayPoints[key].splice(0, this._wayPoints[key].length / 2);
        if (this._wayPoints[key].length < 5) {
          this._wayPoints[key] = [];
        }
      });
    }, 500);
  }

  _draw() {
    requestAnimationFrame(this._draw.bind(this));
    this._canvasContext!.clearRect(
      0,
      0,
      this._canvasContext!.canvas.width,
      this._canvasContext!.canvas.height,
    );
    this._drawRadarSite();
    this._locateFlightObjects();
    this._drawShow();
    this._drawTargetRay();
  }

  _drawRadarSite() {
    const centerOfCanvas = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    this._canvasContext!.fillStyle = "red";

    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      2,
      0,
      Math.PI * 2,
    );
    this._canvasContext!.fill();

    // Draw 25 km circle killzone
    this._canvasContext!.strokeStyle = "red";
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
    if (this._scale <= 3) {
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
    }
    if (this._scale <= 2) {
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
    }

    // Draw radial lines and degrees
    for (let deg = 0; deg < 360; deg += 5) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;
      const map: Record<number, { start: number; end: number }> = {
        2: { start: 50, end: 150 },
        3: { start: 50, end: 100 },
        6: { start: 5, end: 50 },
      };
      const linesDistances = map[this._scale];
      const innerX = centerOfCanvas.x +
        (linesDistances.start * this._scale) * Math.cos(radians);
      const innerY = centerOfCanvas.y +
        (linesDistances.start * this._scale) * Math.sin(radians);
      const outerX = centerOfCanvas.x +
        (linesDistances.end * this._scale) * Math.cos(radians);
      const outerY = centerOfCanvas.y +
        (linesDistances.end * this._scale) * Math.sin(radians);

      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(innerX, innerY);
      this._canvasContext!.lineTo(outerX, outerY);
      this._canvasContext!.stroke();
      this._canvasContext!.font = "bold 14px Arial";
      this._canvasContext!.fillStyle = "white";
      this._canvasContext!.save();
      this._canvasContext!.translate(outerX, outerY);
      this._canvasContext!.rotate(radians + Math.PI / 2);
      this._canvasContext!.textAlign = "center";
      this._canvasContext!.fillText(deg.toString(), 0, -5);
      this._canvasContext!.restore();
    }
  }

  _getVisibleDistance(flightObject: FlightObject) {
    const height = flightObject.currentPoint.z;
    return Math.sqrt(2 * 6371.009 * this.radarHeight) +
      Math.sqrt(2 * 6371.009 * height);
  }

  _getCanvasCoordinates(point: any) {
    return {
      x: point.x * this._scale + this._canvasCenter.x,
      y: point.y * this._scale + this._canvasCenter.y,
    };
  }

  _redrawWayPoints(flightObject: FlightObject) {
    const centerOfCanvas = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    const wayPoints = this._wayPoints[flightObject.identifier!];
    const currentPoint = {
      x: flightObject.currentPoint.x,
      y: flightObject.currentPoint.y,
    };
    const rayWidthRad = this._rayWidth * Math.PI / 180;
    const spotWidth = rayWidthRad * flightObject.visibilityCoefficient;
    if (!wayPoints || flightObject.isDestroyed || !flightObject.isLaunched) {
      return;
    }
    this._wayPoints[flightObject.identifier!].push(currentPoint);

    const pointsToDraw = wayPoints.slice(-100);
    pointsToDraw.forEach((point) => {
      const canvasPoint = this._getCanvasCoordinates(point);
      const distanceToCenter = Math.hypot(
        canvasPoint.x - centerOfCanvas.x,
        canvasPoint.y - centerOfCanvas.y,
      ) / this._scale;
      if (
        distanceToCenter < this._maxLocateDistance &&
        this._getVisibleDistance(flightObject) > distanceToCenter
      ) {
        let angleToCenterRad = Math.atan2(
          centerOfCanvas.y - canvasPoint.y,
          centerOfCanvas.x - canvasPoint.x,
        );
        const k = (distanceToCenter) / 150;
        this._canvasContext!.strokeStyle = `rgba(184, 134, 11,${1 - k})`;
        this._canvasContext!.beginPath();
        this._canvasContext!.arc(
          centerOfCanvas.x,
          centerOfCanvas.y,
          distanceToCenter * this._scale,
          angleToCenterRad - Math.PI - spotWidth / 2,
          angleToCenterRad - Math.PI + spotWidth / 2,
        );
        this._canvasContext!.stroke();
      }
    });
  }

  addFlightObject(flightObject: FlightObject) {
    this._wayPoints[flightObject.identifier!] = [];
    this._flightObjects.push(flightObject);
  }

  _locateFlightObjects() {
    this._flightObjects.map((flightObject) =>
      this._redrawWayPoints(flightObject)
    );
  }

  _drawShow() {
    for (let i = 0; i < 1000; i++) {
      const distanceFromCenter = 150 * this._scale * Math.random();
      const angle = Math.PI * 2 * Math.random();
      const showWidth = 1 * Math.PI / 180;
      this._canvasContext!.beginPath();
      this._canvasContext!.arc(
        this._canvasCenter.x,
        this._canvasCenter.y,
        distanceFromCenter,
        angle,
        angle + showWidth,
      );
      const k = (distanceFromCenter) / (150 * this._scale);
      this._canvasContext!.strokeStyle = `rgba(184, 134, 11,${1 - k})`;
      this._canvasContext!.lineWidth = 3;
      this._canvasContext!.stroke();
      this._canvasContext!.lineWidth = 1;
    }
  }

  _drawTargetRay() {
    const angleWidth = 4 * (Math.PI / 180);
    this._canvasContext!.strokeStyle = 'rgba(255,0,0,0.1)'
    this._canvasContext!.fillStyle = 'rgba(255,0,0,0.1)'
    this._canvasContext!.beginPath();
    this._canvasContext!.arc(
      this._canvasCenter.x,
      this._canvasCenter.y,
      150 * this._scale,
      this._targetRayAngle - Math.PI / 2 - angleWidth / 2,
      this._targetRayAngle - Math.PI / 2 + angleWidth / 2,
    );
    this._canvasContext!.arc(
      this._canvasCenter.x,
      this._canvasCenter.y,
      0,
      this._targetRayAngle - Math.PI / 2 - angleWidth / 2,
      this._targetRayAngle - Math.PI / 2 + angleWidth / 2,
    );
    this._canvasContext!.stroke();
    this._canvasContext!.fill();
  }
}
