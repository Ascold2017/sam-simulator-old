import type FlightObject from "./FlightObject";

type EventListener = (arg0: string, arg1: any) => void;

export default class SNR {
  _targetRadarCanvasContext: CanvasRenderingContext2D | null = null;
  _indicatorCanvasContext: CanvasRenderingContext2D | null = null;
  _distanceRadarCanvasContext: CanvasRenderingContext2D | null = null;
  _azimut = -Math.PI / 2; // rad
  _verticalAngle = 0; // rad
  _targetDistance = 20; // km
  _minVerticalAngle = -5; // degree
  _maxVerticalAngle = 75; // degree
  _maxDistance = 150;
  _flightObjects: FlightObject[] = [];
  _rayWidth = 20; // degree
  _distanceTrackingAccuracy = 0.2; // km
  _distanceDetectRange = 0.5; // km
  _targetRadarCanvasCenter = { x: 0, y: 0 };
  _scale = 1;
  _radarHeight = 36; /// m
  _trackTargetInterval: number | null = null;
  _trackTargetDistanceInterval: number | null = null;
  _trackingTargetIdentifier: string | null = null;
  _eventListener: EventListener | null = null;
  constructor(
    targetRadarCanvas: HTMLCanvasElement,
    indicatorCanvas: HTMLCanvasElement,
    distanceRadarCanvas: HTMLCanvasElement,
    eventListener: EventListener,
  ) {
    this._targetRadarCanvasContext = targetRadarCanvas.getContext("2d");
    this._indicatorCanvasContext = indicatorCanvas.getContext("2d");
    this._distanceRadarCanvasContext = distanceRadarCanvas.getContext("2d");
    this._eventListener = eventListener;
    this._targetRadarCanvasCenter = {
      x: targetRadarCanvas.width / 2,
      y: targetRadarCanvas.height / 2,
    };
    this._drawTargetScreen();
    this._drawIndicatorScreen();
  }

  get azimut() {
    const azimut = (this._azimut + Math.PI / 2) * (180 / Math.PI);
    return azimut < 0 ? azimut + 360 : azimut;
  }

  setAzimut(azimut: number) { // degree
    if (azimut > 360) {
      azimut = azimut - 360;
    }
    if (azimut < 0) {
      azimut = 360 + azimut;
    }

    if (azimut > 270) {
      azimut = azimut - 360;
    }

    this._azimut = (azimut - 90) * Math.PI / 180;
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

  get distanceScreenScale() {
    return this._scale;
  }

  setDistanceScreenScale(scale: number) {
    this._scale = scale;
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
    this._distanceRadarCanvasContext!.clearRect(
      0,
      0,
      this._distanceRadarCanvasContext!.canvas.width,
      this._distanceRadarCanvasContext!.canvas.height,
    );
    this._drawTargetScreenSnow();
    this._drawDistanceScreenSnow();

    this._calculateTargetsPosition();
    this._drawTargetScreenSite();
    this._drawDistanceScreenSite();
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
          const targetVisibilityK = targetDistance / this._maxDistance;
          this._drawTargetScreenTargets(
            canvasX,
            canvasY,
            canvasSpotSize,
            targetVisibilityK,
          );
          const canvasDistanceSpotWidth =
            this._distanceRadarCanvasContext!.canvas.width *
            targetSpotSize;
          const canvasDistanceSpotLength =
            (this._distanceRadarCanvasContext!.canvas.width *
              ((targetSpotSize +
                (this._distanceTrackingAccuracy * Math.random())) * rayWidth) /
              this._scale);

          this._drawDistanceScreenTargets(
            targetDistance,
            canvasDistanceSpotWidth,
            canvasDistanceSpotLength,
            targetVisibilityK,
          );
        }
      }

      if (
        flightObject.identifier === this._trackingTargetIdentifier &&
        this._trackTargetInterval && this._trackTargetDistanceInterval &&
        this._eventListener
      ) {
        this._eventListener("targetDistance", this.targetDistance.toFixed(1));
        this._eventListener("targetVelocity", flightObject._velocity);
        this._eventListener(
          "targetHeight",
          (Math.abs(flightObject.currentPoint.z * 1000)).toFixed(0),
        );
      }
      if (
        flightObject.isDestroyed &&
        this._trackingTargetIdentifier === flightObject.identifier
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
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

  _trackTargetByDirection(flightObject: FlightObject) {
    this._trackTargetInterval && clearInterval(this._trackTargetInterval);
    this._trackingTargetIdentifier = flightObject.identifier;
    this._trackTargetInterval = setInterval(() => {
      // Azimut from SNR to target
      const targetAzimutAngle = Math.atan2(
        flightObject.currentPoint.y,
        flightObject.currentPoint.x,
      );

      // Difference from SNR and target heights
      const targetHeightOffset = flightObject.currentPoint.z -
        this._radarHeight / 1000;

      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );
      // Vertical angle from SNR to target
      const targetVerticalAngle = (targetHeightOffset / targetDistance);

      if (
        targetVerticalAngle < this._minVerticalAngle * Math.PI / 180 ||
        targetVerticalAngle > this._maxVerticalAngle * Math.PI / 180
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
      }

      this._azimut = targetAzimutAngle;
      this._verticalAngle = targetVerticalAngle;
    }, 0);
  }

  captureTargetByDirection() {
    this._flightObjects.forEach((flightObject) => {
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
      const targetSpotAngle = ((2 * Math.sqrt(flightObject.rcs / Math.PI) /
        1000) /
        targetDistance) / rayWidth;

      const isCapturedByAzimut = Math.abs(this._azimut - targetAzimutAngle) <
        Math.abs(targetSpotAngle) * 2;

      // Difference from SNR and target heights
      const targetHeightOffset = flightObject.currentPoint.z -
        this._radarHeight / 1000;
      // Vertical angle from SNR to target
      const targetVerticalAngle = (targetHeightOffset / targetDistance);
      const isCapturedByVerticalAngle =
        Math.abs(this._verticalAngle - targetVerticalAngle) <
          Math.abs(targetSpotAngle);
      if (isCapturedByAzimut && isCapturedByVerticalAngle) {
        this._trackTargetByDirection(flightObject);
        this._eventListener &&
          this._eventListener("isCapturedByDirection", true);
      }
    });
  }

  resetCaptureTargetByDirection() {
    this._trackTargetInterval && clearInterval(this._trackTargetInterval);
    this._trackTargetInterval = null;
    this._trackingTargetIdentifier = null;
    this._eventListener && this._eventListener("isCapturedByDirection", false);
  }

  _drawDistanceScreenSnow() {
    if (!this._distanceRadarCanvasContext) return;
    for (let i = 0; i < 500; i++) {
      const pointX = this._distanceRadarCanvasContext.canvas.width *
        Math.random();
      const pointY = this._distanceRadarCanvasContext.canvas.height *
        Math.random();
      this._distanceRadarCanvasContext.beginPath();
      this._distanceRadarCanvasContext.fillStyle = `rgba(184, 134, 11,${
        1 - Math.random()
      })`;
      this._distanceRadarCanvasContext.arc(
        pointX,
        pointY,
        2,
        0,
        Math.PI * 2,
      );
      this._distanceRadarCanvasContext.fill();
    }
  }

  _drawDistanceScreenSite() {
    if (!this._distanceRadarCanvasContext) return;
    this._distanceRadarCanvasContext.strokeStyle = "white";
    this._distanceRadarCanvasContext.fillStyle = "white";
    const maxDistance = this._maxDistance * this._scale;
    const step = 10 * this._scale;
    for (let distance = 0; distance <= maxDistance; distance += step) {
      const pointY = this._distanceRadarCanvasContext.canvas.height /
        (maxDistance / distance);
      this._distanceRadarCanvasContext.beginPath();
      this._distanceRadarCanvasContext.moveTo(0, pointY);
      this._distanceRadarCanvasContext.lineTo(20, pointY);
      this._distanceRadarCanvasContext.stroke();
      this._distanceRadarCanvasContext.beginPath();
      this._distanceRadarCanvasContext.moveTo(
        this._distanceRadarCanvasContext.canvas.width - 20,
        pointY,
      );
      this._distanceRadarCanvasContext.lineTo(
        this._distanceRadarCanvasContext.canvas.width,
        pointY,
      );
      this._distanceRadarCanvasContext.stroke();
      this._distanceRadarCanvasContext.fillText(
        (maxDistance - distance).toString(),
        5,
        pointY + 15,
      );
    }

    this._distanceRadarCanvasContext.strokeStyle = "red";
    const pointY1 = this._distanceRadarCanvasContext.canvas.height -
      this._distanceRadarCanvasContext.canvas.height *
        ((this._targetDistance - this._distanceDetectRange) /
          (this._maxDistance * this._scale));

    const pointY2 = this._distanceRadarCanvasContext.canvas.height -
      this._distanceRadarCanvasContext.canvas.height *
        ((this._targetDistance + this._distanceDetectRange) /
          (this._maxDistance * this._scale));

    this._distanceRadarCanvasContext.beginPath();
    this._distanceRadarCanvasContext.moveTo(0, pointY1);
    this._distanceRadarCanvasContext.lineTo(
      this._distanceRadarCanvasContext.canvas.width,
      pointY1,
    );
    this._distanceRadarCanvasContext.stroke();

    this._distanceRadarCanvasContext.beginPath();
    this._distanceRadarCanvasContext.moveTo(0, pointY2);
    this._distanceRadarCanvasContext.lineTo(
      this._distanceRadarCanvasContext.canvas.width,
      pointY2,
    );
    this._distanceRadarCanvasContext.stroke();
  }

  _drawDistanceScreenTargets(
    targetDistance: number,
    canvasDistanceSpotWidth: number,
    canvasDistanceSpotLength: number,
    targetVisibilityK: number,
  ) {
    if (!this._distanceRadarCanvasContext) return;
    const maxDistance = this._maxDistance * this._scale;
    const canvasCenterX = this._distanceRadarCanvasContext.canvas.width / 2;
    const pointY = this._distanceRadarCanvasContext.canvas.height -
      this._distanceRadarCanvasContext.canvas.height /
        (maxDistance / targetDistance);
    this._distanceRadarCanvasContext!.fillStyle = `rgba(184, 134, 11,${
      1 - targetVisibilityK
    })`;
    this._distanceRadarCanvasContext!.beginPath();
    this._distanceRadarCanvasContext!.ellipse(
      canvasCenterX,
      pointY,
      canvasDistanceSpotLength / 2,
      canvasDistanceSpotWidth / 2,
      Math.PI / 2,
      0,
      Math.PI * 2,
    );
    this._distanceRadarCanvasContext!.fill();
  }

  get targetDistance() {
    return this._targetDistance;
  }

  setTargetDistance(distance: number) {
    if (distance > 0 && distance < this._maxDistance) {
      this._targetDistance = distance;
    }
  }

  captureTargetByDistance() {
    this._flightObjects.forEach((flightObject) => {
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      if (
        Math.abs(targetDistance - this._targetDistance) <
          this._distanceDetectRange &&
        this._trackingTargetIdentifier === flightObject.identifier
      ) {
        this._trackTargetByDistance();
        this._eventListener &&
          this._eventListener("isCapturedByDistance", true);
      }
    });
  }

  resetCaptureTargetByDistance() {
    this._trackTargetDistanceInterval &&
      clearInterval(this._trackTargetDistanceInterval);
    this._trackTargetDistanceInterval = null;
    this._eventListener && this._eventListener("isCapturedByDistance", false);
  }

  _trackTargetByDistance() {
    this._trackTargetDistanceInterval &&
      clearInterval(this._trackTargetDistanceInterval);

    const flightObject = this._flightObjects.find((flightObject) =>
      flightObject.identifier === this._trackingTargetIdentifier
    )!;
    this._trackTargetDistanceInterval = setInterval(() => {
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      if (
        targetDistance > this._maxDistance
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
      }

      this._targetDistance = targetDistance;
    }, 0);
  }
}
