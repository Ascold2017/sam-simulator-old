import type Rocket from "./Rocket";

export default class Bip {
  _rockets: Rocket[] = [];
  _scale = 2;
  _canvasContext: CanvasRenderingContext2D | null = null;
  _canvasWidth = 0;
  _wayPoints: Record<string, { x: number; y: number }[]> = {};
  constructor({ canvasBip }: { canvasBip: any }) {
    this._canvasContext = canvasBip.getContext("2d");
    this._canvasWidth = canvasBip.width;
    this._draw();
  }

  _draw() {
    this._drawSite();
    this._rockets.map((rocket) => this._drawRocketWay(rocket));
    setInterval(() => {
      this._rockets.map((rocket) => this._drawRocketWay(rocket));
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

  _drawRocketWay(rocket: Rocket) {
    if (!rocket.isLaunched) return;

    const wayPoints = this._wayPoints[rocket.identifier!];
    const prevPoint = wayPoints.length >= 1
      ? wayPoints[wayPoints.length - 1]
      : rocket.currentPoint;
    const heightText = rocket.currentPoint.z < 10
      ? `0${Number(rocket.currentPoint.z * 10).toFixed(0)}`
      : Number(rocket.currentPoint.z * 10).toFixed(0);

    if (
      rocket.isDestroyed && prevPoint.x === rocket.currentPoint.x &&
      prevPoint.y === rocket.currentPoint.y
    ) {
      return;
    }

    if (wayPoints.length === 0) {
      this._canvasContext!.fillStyle = "white";
      this._canvasContext!.strokeStyle = "white";

      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(
        rocket.currentPoint.x,
        rocket.currentPoint.y - 20,
      );
      this._canvasContext!.lineTo(
        rocket.currentPoint.x,
        rocket.currentPoint.y + 20,
      );

      this._canvasContext!.stroke();
      this._canvasContext!.moveTo(rocket.currentPoint.x, rocket.currentPoint.y);
      this._canvasContext!.lineTo(
        rocket.currentPoint.x + 50,
        rocket.currentPoint.y,
      );
      this._canvasContext!.stroke();
      this._canvasContext!.font = "16px Arial";
      this._canvasContext!.fillText(
        "2401",
        rocket.currentPoint.x - 40,
        rocket.currentPoint.y,
      );
      this._canvasContext!.font = "14px Arial";

      this._canvasContext!.fillText(
        String(heightText),
        rocket.currentPoint.x + 10,
        rocket.currentPoint.y - 10,
      );
      this._canvasContext!.fillText(
        "81",
        rocket.currentPoint.x + 10,
        rocket.currentPoint.y + 15,
      );
    } else {
      this._canvasContext!.beginPath();
      this._canvasContext!.moveTo(prevPoint.x, prevPoint.y);
      this._canvasContext!.lineJoin = "miter";
      this._canvasContext!.strokeStyle = "white";
      this._canvasContext!.fillStyle = "white";
      this._canvasContext!.font = "12px Arial";
      this._canvasContext!.lineTo(rocket.currentPoint.x, rocket.currentPoint.y);

      if (!rocket.isDestroyed) {
        this._canvasContext!.fillText(
          String(wayPoints.length + 1),
          rocket.currentPoint.x,
          rocket.currentPoint.y - 2,
        );
        this._canvasContext!.stroke();
        const firstPoint = wayPoints[0];
        this._canvasContext!.beginPath();
        this._canvasContext!.clearRect(
          firstPoint.x + 10,
          firstPoint.y - 25,
          50,
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
          rocket.currentPoint.x - 10,
          rocket.currentPoint.y - 10,
        );
        this._canvasContext!.lineTo(
          rocket.currentPoint.x + 10,
          rocket.currentPoint.y + 10,
        );

        this._canvasContext!.moveTo(
          rocket.currentPoint.x + 10,
          rocket.currentPoint.y - 10,
        );
        this._canvasContext!.lineTo(
          rocket.currentPoint.x - 10,
          rocket.currentPoint.y + 10,
        );
        this._canvasContext!.stroke();
      }
    }

    this._wayPoints[rocket.identifier!].push(rocket.currentPoint);
  }

  addRocket(rocket: Rocket) {
    this._wayPoints[rocket.identifier!] = [];
    this._rockets.push(rocket);
  }
}
