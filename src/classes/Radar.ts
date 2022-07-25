import type Rocket from "./Rocket";
interface IRadar {
  scale: number;
  canvasRadar: any;
  rayWidth?: number
}
export default class Radar {
  _rockets: Rocket[] = [];
  _scale = 1;
  _canvasContext: CanvasRenderingContext2D | null = null;
  _canvasWidth = 0;
  _wayPoints: Record<string, { x: number; y: number }[]> = {};
  _rayWidth = 0;
  _offsetOfBip = 175;
  constructor({
    scale = 1,
    canvasRadar,
    rayWidth = 2, // in degrees
  }: IRadar) {
    this._canvasContext = canvasRadar.getContext("2d");
    this._canvasWidth = canvasRadar.width;
    this._scale = scale;
    this._rayWidth = rayWidth;

    this._draw();
    this._cleanupWaypoints();
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
    this._canvasContext!.clearRect(0, 0, this._canvasWidth, this._canvasWidth);
    this._drawRadarSite();
    this.locateRockets();
  }

  _drawRadarSite() {
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

  _redrawWayPoints(rocket: Rocket) {
    const centerOfCanvas = {
      x: this._canvasContext!.canvas.width / 2,
      y: this._canvasContext!.canvas.height / 2,
    };
    const wayPoints = this._wayPoints[rocket.identifier!];
    const currentPoint = {
      x: rocket.currentPoint.x - this._offsetOfBip,
      y: rocket.currentPoint.y - this._offsetOfBip,
    };
    const rayWidthRad = this._rayWidth * Math.PI / 180;
    const spotWidth = rayWidthRad * rocket.visibilityCoefficient;
    if (!wayPoints || rocket.isDestroyed || !rocket.isLaunched) return;
    this._wayPoints[rocket.identifier!].push(currentPoint);

    const pointsToDraw = wayPoints.slice(-100);
    pointsToDraw.forEach((point) => {
      const distanceToCenter = Math.hypot(
        point.x - centerOfCanvas.x,
        point.y - centerOfCanvas.y,
      );
      if (distanceToCenter / this._scale < 150) {
        let angleToCenterRad = Math.atan2(
          centerOfCanvas.y - point.y,
          centerOfCanvas.x - point.x,
        );
        this._canvasContext!.strokeStyle = "darkorange";
        this._canvasContext!.beginPath();
        this._canvasContext!.arc(
          centerOfCanvas.x,
          centerOfCanvas.y,
          distanceToCenter,
          angleToCenterRad - Math.PI - spotWidth / 2,
          angleToCenterRad - Math.PI + spotWidth / 2,
        );
        this._canvasContext!.stroke();
      }
    });
  }

  addRocket(rocket: Rocket) {
    this._wayPoints[rocket.identifier!] = [];
    this._rockets.push(rocket);
  }

  locateRockets() {
    this._rockets.map((rocket) => this._redrawWayPoints(rocket));
  }
}
