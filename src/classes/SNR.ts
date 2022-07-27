import type FlightObject from "./FlightObject";

export default class SNR {
  _targetRadarCanvasContext: CanvasRenderingContext2D | null = null;
  _indicatorCanvasContext: CanvasRenderingContext2D | null = null;
  _azimut = -Math.PI / 2; // rad
  _verticalAngle = 0; // rad
  _minVerticalAngle = -5; // degree
  _maxVerticalAngle = 75; // degree
  _flightObjects: FlightObject[] = [];
  _rayWidth = 20; // degree
  _targetRadarCanvasCenter = { x: 0, y: 0 };
  _scale = 1;
  _radarHeight = 36; /// m
  constructor(
    targetRadarCanvas: HTMLCanvasElement,
    indicatorCanvas: HTMLCanvasElement,
  ) {
    this._targetRadarCanvasContext = targetRadarCanvas.getContext("2d");
    this._indicatorCanvasContext = indicatorCanvas.getContext("2d");
    this._targetRadarCanvasCenter = {
      x: targetRadarCanvas.width / 2,
      y: targetRadarCanvas.height / 2,
    };
    this._drawTargetScreen();
    this._drawIndicatorScreen();
  }

  get azimut() {
    return (this._azimut + Math.PI / 2) * (180 / Math.PI);
  }

  setAzimut(azimut: number) { // degree
    if (azimut > 360) {
      azimut = azimut - 360;
    }
    if (azimut < 0) {
      azimut = 360 - azimut;
    }

    this._azimut = azimut * Math.PI / 180 - Math.PI / 2;
  }

  get verticalAngle() {
    return this._verticalAngle * (180 / Math.PI);
  }

  setVerticalAngle(verticalAngle: number) { // degree
    if (
      verticalAngle > this._minVerticalAngle &&
      verticalAngle < this._maxVerticalAngle
    ) {
      this._verticalAngle = verticalAngle * Math.PI / 180;
    }
  }

  get rayWidth() {
    return this._rayWidth;
  }

  setRayWidth(deg: number) {
    this._rayWidth = deg;
  }

  addFlightObject(flightObject: FlightObject) {
    this._flightObjects.push(flightObject);
  }

  _drawIndicatorScreen() {
    requestAnimationFrame(this._drawIndicatorScreen.bind(this));
    if (!this._indicatorCanvasContext) return;
    this._indicatorCanvasContext.clearRect(
      0,
      0,
      this._indicatorCanvasContext.canvas.width,
      this._indicatorCanvasContext.canvas.height,
    );
    this._drawAzimutIndicator();
    this._drawVerticalAngleIndicator();
  }

  _drawAzimutIndicator() {
    if (!this._indicatorCanvasContext) return;

    const canvasCenterY = this._indicatorCanvasContext.canvas.height / 2;
    const canvasCenterX = this._indicatorCanvasContext.canvas.width / 2;
    const radius = canvasCenterY;
    this._indicatorCanvasContext.strokeStyle = "white";
    this._indicatorCanvasContext.lineWidth = 1;
    this._indicatorCanvasContext.beginPath();
    this._indicatorCanvasContext.arc(
      canvasCenterX / 2,
      canvasCenterY,
      radius,
      0,
      Math.PI * 2,
    );
    this._indicatorCanvasContext.stroke();

    const pointX = radius * Math.cos(this._azimut) + canvasCenterX / 2;
    const pointY = radius * Math.sin(this._azimut) + canvasCenterY;

    this._indicatorCanvasContext.moveTo(canvasCenterX / 2, canvasCenterY);
    this._indicatorCanvasContext.lineTo(pointX, pointY);
    this._indicatorCanvasContext.stroke();
    const textMeasurements = this._indicatorCanvasContext.measureText(
      Number(this.azimut).toFixed(1),
    );
    this._indicatorCanvasContext.fillStyle = "white";
    this._indicatorCanvasContext.font = "bold 14px Arial";
    this._indicatorCanvasContext.fillText(
      Number(this.azimut).toFixed(1),
      canvasCenterX / 2 - textMeasurements.width / 2,
      canvasCenterY - 10,
    );

    // Draw radial lines and degrees
    for (let deg = 0; deg < 360; deg += 5) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;

      const innerX = canvasCenterX / 2 +
        (radius - 5) * Math.cos(radians);
      const innerY = canvasCenterY +
        (radius - 5) * Math.sin(radians);
      const outerX = canvasCenterX / 2 +
        radius * Math.cos(radians);
      const outerY = canvasCenterY +
        radius * Math.sin(radians);

      this._indicatorCanvasContext!.beginPath();
      this._indicatorCanvasContext!.moveTo(innerX, innerY);
      this._indicatorCanvasContext!.lineTo(outerX, outerY);
      this._indicatorCanvasContext!.stroke();
    }
  }

  _drawVerticalAngleIndicator() {
    if (!this._indicatorCanvasContext) return;
    const canvasWidth = this._indicatorCanvasContext?.canvas.width;
    const canvasHeight = this._indicatorCanvasContext?.canvas.height;
    const offsetY = 10;
    const availableCanvasHeight = canvasHeight - offsetY * 2;
    for (
      let deg = this._minVerticalAngle, numOfLine = 1;
      deg <= this._maxVerticalAngle;
      deg += 5, numOfLine++
    ) {
      const totalAngle = Math.abs(this._minVerticalAngle) +
        Math.abs(this._maxVerticalAngle);
      const normalizedDeg = deg +
        Math.abs(this._minVerticalAngle);
      const lineY = (availableCanvasHeight + offsetY) -
        availableCanvasHeight * (normalizedDeg / totalAngle) +
        offsetY;
      this._indicatorCanvasContext.strokeStyle = "white";
      this._indicatorCanvasContext.beginPath();
      this._indicatorCanvasContext.moveTo(canvasWidth, lineY);
      this._indicatorCanvasContext.lineTo(canvasWidth - 150, lineY);
      this._indicatorCanvasContext.stroke();

      this._indicatorCanvasContext.fillStyle = "white";
      this._indicatorCanvasContext.font = "11px Arial";
      const textMeasurements = this._indicatorCanvasContext.measureText(
        Number(deg).toString(),
      );
      this._indicatorCanvasContext.fillText(
        Number(deg).toString(),
        canvasWidth - 150 - textMeasurements.width - 5,
        lineY,
      );
      const normalizedVerticalAngle = this.verticalAngle +
        Math.abs(this._minVerticalAngle);
      const indicatorLineY = (availableCanvasHeight + offsetY) -
        availableCanvasHeight * (normalizedVerticalAngle / totalAngle) +
        offsetY;

      this._indicatorCanvasContext.strokeStyle = "red";
      this._indicatorCanvasContext.beginPath();
      this._indicatorCanvasContext.moveTo(canvasWidth, indicatorLineY);
      this._indicatorCanvasContext.lineTo(canvasWidth - 150, indicatorLineY);
      this._indicatorCanvasContext.stroke();
    }
  }

  _drawTargetScreen() {
    requestAnimationFrame(this._drawTargetScreen.bind(this));
    this._targetRadarCanvasContext!.clearRect(
      0,
      0,
      this._targetRadarCanvasContext!.canvas.width,
      this._targetRadarCanvasContext!.canvas.height,
    );

    this._calculateTargetsPosition();
    this._drawTargetScreenSnow();
    this._drawTargetScreenSite();
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

  _calculateTargetsPosition() {
    for (const flightObject of this._flightObjects) {
      if (flightObject.isLaunched && !flightObject.isDestroyed) {
        // Distance from SNR to target
        const targetDistance = Math.hypot(
          flightObject.currentPoint.x,
          flightObject.currentPoint.y,
        );
        // Azimut from SNR to target
        const targetAzimutAngle = Math.atan2(
          flightObject.currentPoint.y,
          flightObject.currentPoint.x,
        );
        // Difference from SNR and target heights
        const targetHeightOffset = flightObject.currentPoint.z -
          this._radarHeight / 1000;
        // Vertical angle from SNR to target
        const targetVerticalAngle = (targetHeightOffset / targetDistance);

        // Angle of ray of SNR
        const rayWidthRad = this._rayWidth * Math.PI / 180;
        // Difference of SNR azimut and target azimut
        const targetAzimutOffset = this._azimut - targetAzimutAngle;
        // Difference of SNR vertical angle and target vertical angle
        const targetVerticalOffset = targetVerticalAngle - this._verticalAngle;

        // If target inside of SNR ray
        if (
          Math.abs(targetAzimutOffset) < (rayWidthRad / 2) &&
          Math.abs(targetVerticalOffset) < (rayWidthRad / 2)
        ) {
          // Calculate target position on canvas
          const canvasX = -(targetAzimutOffset / rayWidthRad * 2) *
              this._targetRadarCanvasCenter.x + this._targetRadarCanvasCenter.x;
          const canvasY = -(targetVerticalOffset / rayWidthRad * 2) *
              this._targetRadarCanvasCenter.y + this._targetRadarCanvasCenter.y;

          const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);
          const targetSize = 2 * Math.sqrt(flightObject.rcs / Math.PI) / 1000; // Size in km; rcs converted to diameter of circle with same scale
          const targetSpotSize = targetSize / rayWidth;
          const canvasSpotSize = this._targetRadarCanvasContext!.canvas.width *
            targetSpotSize;
          const targetVisibilityK = targetDistance / 150;
          this._drawTargetScreenTargets(
            canvasX,
            canvasY,
            canvasSpotSize,
            targetVisibilityK,
          );
        }
      }
    }
  }

  _drawTargetScreenTargets(
    canvasX: number,
    canvasY: number,
    targetSpotSize: number,
    targetVisibilityK: number,
  ) {
    this._targetRadarCanvasContext!.fillStyle = `rgba(184, 134, 11,${
      1 - targetVisibilityK
    })`;
    this._targetRadarCanvasContext!.beginPath();
    this._targetRadarCanvasContext!.ellipse(
      canvasX,
      canvasY,
      targetSpotSize / 2,
      targetSpotSize,
      Math.PI / 2,
      0,
      Math.PI * 2,
    );
    this._targetRadarCanvasContext!.fill();
  }

  _drawTargetScreenSnow() {
    if (!this._targetRadarCanvasContext) return;
    const canvasSize = this._targetRadarCanvasContext?.canvas.width;
    for (let i = 0; i < 500; i++) {
      const pointX = canvasSize * Math.random();
      const pointY = canvasSize * Math.random();
      this._targetRadarCanvasContext.beginPath();
      this._targetRadarCanvasContext.fillStyle = `rgba(184, 134, 11,${
        1 - Math.random()
      })`;
      this._targetRadarCanvasContext.arc(
        pointX,
        pointY,
        2,
        0,
        Math.PI * 2,
      );
      this._targetRadarCanvasContext.fill();
    }
  }

  captureTargetByDirection() {
    this._flightObjects.find((flightObject) => {
      // Azimut from SNR to target
      const targetAzimutAngle = Math.atan2(
        flightObject.currentPoint.y,
        flightObject.currentPoint.x,
      );
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );
      // Angle of ray of SNR
      const rayWidthRad = this._rayWidth * Math.PI / 180;
      const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);
      // Azimut of target spot
      const targetSpotAzimut = ((2 * Math.sqrt(flightObject.rcs / Math.PI) /
        1000) /
        targetDistance) / rayWidth;

      const isCapturedByAzimut =
        Math.abs(this._azimut - targetAzimutAngle) <
          Math.abs(targetSpotAzimut) * 1.5;

      if (isCapturedByAzimut) {
        console.log("target capture!");
      }
    });
  }
}
