import type FlightObject from "./FlightObject";

export default class SNR {
  _targetRadarCanvasContext: CanvasRenderingContext2D | null = null;
  _azimut = 0; // rad
  _verticalAngle = 0; // rad
  _flightObjects: FlightObject[] = [];
  _rayWidth = 8; // degree
  _targetRadarCanvasCenter = { x: 0, y: 0 };
  _scale = 1;
  _radarHeight = 36; /// m
  constructor(targetRadarCanvas: HTMLCanvasElement) {
    this._targetRadarCanvasContext = targetRadarCanvas.getContext("2d");
    this._targetRadarCanvasCenter = {
      x: targetRadarCanvas.width / 2,
      y: targetRadarCanvas.height / 2,
    };
    this._drawTargetScreen();
  }

  get azimut() {
    return this._azimut * (180 / Math.PI);
  }

  setAzimut(azimut: number) { // degree
    console.log(azimut);
    this._azimut = azimut * Math.PI / 180 - Math.PI / 2;
  }

  setRayWidth(deg: number) {
    this._rayWidth = deg;
  }

  addFlightObject(flightObject: FlightObject) {
    this._flightObjects.push(flightObject);
  }
  _drawTargetScreenSite() {
    this._targetRadarCanvasContext!.strokeStyle = "white";
    this._targetRadarCanvasContext!.beginPath();
    this._targetRadarCanvasContext!.moveTo(
      this._targetRadarCanvasCenter.x,
      0,
    );
    this._targetRadarCanvasContext!.lineTo(
      this._targetRadarCanvasCenter.x,
      this._targetRadarCanvasContext!.canvas.height,
    );
    this._targetRadarCanvasContext!.stroke();
    this._targetRadarCanvasContext!.moveTo(
      0,
      this._targetRadarCanvasCenter.y,
    );
    this._targetRadarCanvasContext!.lineTo(
      this._targetRadarCanvasContext!.canvas.width,
      this._targetRadarCanvasCenter.y,
    );
    this._targetRadarCanvasContext!.stroke();
  }

  _drawTargetScreenTargets() {
    this._flightObjects.filter((flightObject) =>
      flightObject.isLaunched && !flightObject.isDestroyed
    ).forEach((flightObject) => {
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );
      const targetAzimutAngle = Math.atan2(
        flightObject.currentPoint.y,
        flightObject.currentPoint.x,
      );
      const targetHeightOffset = flightObject.currentPoint.z -
        this._radarHeight / 1000;
      const targetVerticalAngle = (targetHeightOffset / targetDistance);

      const rayWidthRad = this._rayWidth * Math.PI / 180;
      const targetAzimutOffset = this._azimut - targetAzimutAngle;
      const targetVerticalOffset = targetVerticalAngle - this._verticalAngle;

      if (
        Math.abs(targetAzimutOffset) < (rayWidthRad / 2) &&
        Math.abs(targetVerticalOffset) < (rayWidthRad / 2)
      ) {
        const canvasX = -(targetAzimutOffset / rayWidthRad * 2) *
            this._targetRadarCanvasCenter.x + this._targetRadarCanvasCenter.x;
        const canvasY =
          -(targetVerticalOffset / rayWidthRad * 2) *
            this._targetRadarCanvasCenter.y + this._targetRadarCanvasCenter.y;

        this._targetRadarCanvasContext!.fillStyle = "red";
        this._targetRadarCanvasContext!.beginPath();
        this._targetRadarCanvasContext?.arc(
          canvasX,
          canvasY,
          3,
          0,
          Math.PI * 2,
        );
        this._targetRadarCanvasContext!.fill();
      }
    });
  }

  _drawTargetScreen() {
    requestAnimationFrame(this._drawTargetScreen.bind(this))
    this._targetRadarCanvasContext!.clearRect(
      0,
      0,
      this._targetRadarCanvasContext!.canvas.width,
      this._targetRadarCanvasContext!.canvas.height,
    );
    this._drawTargetScreenSite();
    this._drawTargetScreenTargets();
  }
}
