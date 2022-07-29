import type FlightObject from "./FlightObject";
import type SAMissile from "./SAMissile";

type EventListener = (arg0: string, arg1: any) => void;

export default class SNR {
  private targetRadarCanvasContext: CanvasRenderingContext2D | null = null;
  private indicatorCanvasContext: CanvasRenderingContext2D | null = null;
  private distanceRadarCanvasContext: CanvasRenderingContext2D | null = null;
  private azimut = -Math.PI / 2; // rad
  private verticalAngle = 0; // rad
  private targetDistance = 20; // km
  private minVerticalAngle = -5; // degree
  private maxVerticalAngle = 75; // degree
  private maxDistance = 150;
  private flightObjects: FlightObject[] = [];
  private rayWidth = 20; // degree
  private distanceTrackingAccuracy = 0.2; // km
  private distanceDetectRange = 0.5; // km
  private targetRadarCanvasCenter = { x: 0, y: 0 };
  private scale = 1;
  private radarHeight = 36; /// m
  private trackTargetInterval: number | null = null;
  private trackTargetDistanceInterval: number | null = null;
  private trackingTargetIdentifier: string | null = null;
  private eventListener: EventListener | null = null;
  private missiles: SAMissile[] = [];
  private missileVelocity = 0;
  private missileMaxDistance = 0;
  constructor(
    targetRadarCanvas: HTMLCanvasElement,
    indicatorCanvas: HTMLCanvasElement,
    distanceRadarCanvas: HTMLCanvasElement,
    eventListener: EventListener,
    missileVelocity: number,
    missileMaxDistance: number,
  ) {
    this.targetRadarCanvasContext = targetRadarCanvas.getContext("2d");
    this.indicatorCanvasContext = indicatorCanvas.getContext("2d");
    this.distanceRadarCanvasContext = distanceRadarCanvas.getContext("2d");
    this.eventListener = eventListener;
    this.missileVelocity = missileVelocity;
    this.missileMaxDistance = missileMaxDistance;
    this.targetRadarCanvasCenter = {
      x: targetRadarCanvas.width / 2,
      y: targetRadarCanvas.height / 2,
    };
    this.drawTargetScreen();
    this.drawIndicatorScreen();
  }

  get trackedTarget() {
    return this.flightObjects.find((fo) =>
      fo.identifier === this.trackingTargetIdentifier
    );
  }

  get azimutDeg() {
    const azimut = (this.azimut + Math.PI / 2) * (180 / Math.PI);
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

    this.azimut = (azimut - 90) * Math.PI / 180;
  }

  get verticalAngleDeg() {
    return this.verticalAngle * (180 / Math.PI);
  }

  setVerticalAngle(verticalAngle: number) { // degree
    if (
      verticalAngle > this.minVerticalAngle &&
      verticalAngle < this.maxVerticalAngle
    ) {
      this.verticalAngle = verticalAngle * Math.PI / 180;
    }
  }

  get radarRayWidth() {
    return this.rayWidth;
  }

  setRadarRayWidth(deg: number) {
    this.rayWidth = deg;
  }

  get distanceScreenScale() {
    return this.scale;
  }

  setDistanceScreenScale(scale: number) {
    this.scale = scale;
  }

  public addFlightObject(flightObject: FlightObject) {
    this.flightObjects.push(flightObject);
  }

  private drawIndicatorScreen() {
    requestAnimationFrame(this.drawIndicatorScreen.bind(this));
    if (!this.indicatorCanvasContext) return;
    this.indicatorCanvasContext.clearRect(
      0,
      0,
      this.indicatorCanvasContext.canvas.width,
      this.indicatorCanvasContext.canvas.height,
    );
    this.drawAzimutIndicator();
    this.drawVerticalAngleIndicator();
  }

  private drawAzimutIndicator() {
    if (!this.indicatorCanvasContext) return;
    const ctx = this.indicatorCanvasContext;

    const canvasCenterY = ctx.canvas.height / 2;
    const canvasCenterX = ctx.canvas.width / 2;
    const radius = canvasCenterY;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      canvasCenterX / 2,
      canvasCenterY,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    const pointX = radius * Math.cos(this.azimut) + canvasCenterX / 2;
    const pointY = radius * Math.sin(this.azimut) + canvasCenterY;

    ctx.moveTo(canvasCenterX / 2, canvasCenterY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();
    const textMeasurements = ctx.measureText(
      Number(this.azimutDeg).toFixed(1),
    );
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText(
      Number(this.azimutDeg).toFixed(1),
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

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }
  }

  private drawVerticalAngleIndicator() {
    if (!this.indicatorCanvasContext) return;
    const ctx = this.indicatorCanvasContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const offsetY = 10;
    const availableCanvasHeight = canvasHeight - offsetY * 2;
    for (
      let deg = this.minVerticalAngle, numOfLine = 1;
      deg <= this.maxVerticalAngle;
      deg += 5, numOfLine++
    ) {
      const totalAngle = Math.abs(this.minVerticalAngle) +
        Math.abs(this.maxVerticalAngle);
      const normalizedDeg = deg +
        Math.abs(this.minVerticalAngle);
      const lineY = (availableCanvasHeight + offsetY) -
        availableCanvasHeight * (normalizedDeg / totalAngle) +
        offsetY;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(canvasWidth, lineY);
        ctx.lineTo(canvasWidth - 150, lineY);
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "11px Arial";
      const textMeasurements = ctx.measureText(
        Number(deg).toString(),
      );
      ctx.fillText(
        Number(deg).toString(),
        canvasWidth - 150 - textMeasurements.width - 5,
        lineY,
      );
      const normalizedVerticalAngle = this.verticalAngleDeg +
        Math.abs(this.minVerticalAngle);
      const indicatorLineY = (availableCanvasHeight + offsetY) -
        availableCanvasHeight * (normalizedVerticalAngle / totalAngle) +
        offsetY;

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(canvasWidth, indicatorLineY);
        ctx.lineTo(canvasWidth - 150, indicatorLineY);
        ctx.stroke();
    }
  }

  private drawTargetScreen() {
    requestAnimationFrame(this.drawTargetScreen.bind(this));
    this.targetRadarCanvasContext!.clearRect(
      0,
      0,
      this.targetRadarCanvasContext!.canvas.width,
      this.targetRadarCanvasContext!.canvas.height,
    );
    this.distanceRadarCanvasContext!.clearRect(
      0,
      0,
      this.distanceRadarCanvasContext!.canvas.width,
      this.distanceRadarCanvasContext!.canvas.height,
    );
    this.drawTargetScreenSnow();
    this.drawDistanceScreenSnow();

    this.calculateTargetsPosition();
    this.drawTargetScreenSite();
    this.drawDistanceScreenSite();

    this.calculateMissiles();
  }

  private drawTargetScreenSite() {
    const ctx = this.targetRadarCanvasContext;
    if (!ctx) return;
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(
      this.targetRadarCanvasCenter.x,
      0,
    );
    ctx.lineTo(
      this.targetRadarCanvasCenter.x,
      ctx.canvas.height,
    );
    ctx.stroke();
    ctx.moveTo(
      0,
      this.targetRadarCanvasCenter.y,
    );
    ctx.lineTo(
      ctx.canvas.width,
      this.targetRadarCanvasCenter.y,
    );
    ctx.stroke();
  }

  private calculateTargetsPosition() {
    for (const flightObject of this.flightObjects) {
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
          this.radarHeight / 1000;
        // Vertical angle from SNR to target
        const targetVerticalAngle = (targetHeightOffset / targetDistance);

        // Angle of ray of SNR
        const rayWidthRad = this.rayWidth * Math.PI / 180;
        // Difference of SNR azimut and target azimut
        const targetAzimutOffset = this.azimut - targetAzimutAngle;
        // Difference of SNR vertical angle and target vertical angle
        const targetVerticalOffset = targetVerticalAngle - this.verticalAngle;

        // If target inside of SNR ray
        if (
          Math.abs(targetAzimutOffset) < (rayWidthRad / 2) &&
          Math.abs(targetVerticalOffset) < (rayWidthRad / 2)
        ) {
          // Calculate target position on canvas
          const canvasX = -(targetAzimutOffset / rayWidthRad * 2) *
              this.targetRadarCanvasCenter.x + this.targetRadarCanvasCenter.x;
          const canvasY = -(targetVerticalOffset / rayWidthRad * 2) *
              this.targetRadarCanvasCenter.y + this.targetRadarCanvasCenter.y;

          const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);
          const targetSize = 2 * Math.sqrt(flightObject.rcs / Math.PI) / 1000; // Size in km; rcs converted to diameter of circle with same scale
          const targetSpotSize = targetSize / rayWidth;
          const canvasSpotSize = this.targetRadarCanvasContext!.canvas.width *
            targetSpotSize;
          const targetVisibilityK = targetDistance / this.maxDistance;
          this.drawTargetScreenTargets(
            canvasX,
            canvasY,
            canvasSpotSize,
            targetVisibilityK,
          );
          const canvasDistanceSpotWidth =
            this.distanceRadarCanvasContext!.canvas.width *
            targetSpotSize;
          const canvasDistanceSpotLength =
            (this.distanceRadarCanvasContext!.canvas.width *
              ((targetSpotSize +
                (this.distanceTrackingAccuracy * Math.random())) * rayWidth) /
              this.scale);

          this.drawDistanceScreenTargets(
            targetDistance,
            canvasDistanceSpotWidth,
            canvasDistanceSpotLength,
            targetVisibilityK,
            flightObject._velocity,
          );
        }
      }

      if (
        flightObject.identifier === this.trackingTargetIdentifier &&
        this.trackTargetInterval && this.trackTargetDistanceInterval &&
        this.eventListener
      ) {
        this.eventListener("targetDistance", this.targetDistance.toFixed(1));
        this.eventListener("targetVelocity", flightObject._velocity);
        this.eventListener(
          "targetHeight",
          (Math.abs(flightObject.currentPoint.z * 1000)).toFixed(0),
        );
      }
      if (
        flightObject.isDestroyed &&
        this.trackingTargetIdentifier === flightObject.identifier
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
      }
    }
  }

  private drawTargetScreenTargets(
    canvasX: number,
    canvasY: number,
    targetSpotSize: number,
    targetVisibilityK: number,
  ) {
    this.targetRadarCanvasContext!.fillStyle = `rgba(184, 134, 11,${
      1 - targetVisibilityK
    })`;
    this.targetRadarCanvasContext!.beginPath();
    this.targetRadarCanvasContext!.ellipse(
      canvasX,
      canvasY,
      targetSpotSize / 2,
      targetSpotSize,
      Math.PI / 2,
      0,
      Math.PI * 2,
    );
    this.targetRadarCanvasContext!.fill();
  }

  private drawTargetScreenSnow() {
    if (!this.targetRadarCanvasContext) return;
    const canvasSize = this.targetRadarCanvasContext?.canvas.width;
    for (let i = 0; i < 500; i++) {
      const pointX = canvasSize * Math.random();
      const pointY = canvasSize * Math.random();
      this.targetRadarCanvasContext.beginPath();
      this.targetRadarCanvasContext.fillStyle = `rgba(184, 134, 11,${
        1 - Math.random()
      })`;
      this.targetRadarCanvasContext.arc(
        pointX,
        pointY,
        2,
        0,
        Math.PI * 2,
      );
      this.targetRadarCanvasContext.fill();
    }
  }

  private trackTargetByDirection(flightObject: FlightObject) {
    this.trackTargetInterval && clearInterval(this.trackTargetInterval);
    this.trackingTargetIdentifier = flightObject.identifier;
    this.trackTargetInterval = setInterval(() => {
      // Azimut from SNR to target
      const targetAzimutAngle = Math.atan2(
        flightObject.currentPoint.y,
        flightObject.currentPoint.x,
      );

      // Difference from SNR and target heights
      const targetHeightOffset = flightObject.currentPoint.z -
        this.radarHeight / 1000;

      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );
      // Vertical angle from SNR to target
      const targetVerticalAngle = (targetHeightOffset / targetDistance);

      if (
        targetVerticalAngle < this.minVerticalAngle * Math.PI / 180 ||
        targetVerticalAngle > this.maxVerticalAngle * Math.PI / 180
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
      }

      this.azimut = targetAzimutAngle;
      this.verticalAngle = targetVerticalAngle;
    }, 0);
  }

  captureTargetByDirection() {
    this.flightObjects.forEach((flightObject) => {
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
      const rayWidthRad = this.rayWidth * Math.PI / 180;
      const rayWidth = ((Math.PI * rayWidthRad * targetDistance) / 180);
      // Azimut of target spot
      const targetSpotAngle = ((2 * Math.sqrt(flightObject.rcs / Math.PI) /
        1000) /
        targetDistance) / rayWidth;

      const isCapturedByAzimut = Math.abs(this.azimut - targetAzimutAngle) <
        Math.abs(targetSpotAngle) * 2;

      // Difference from SNR and target heights
      const targetHeightOffset = flightObject.currentPoint.z -
        this.radarHeight / 1000;
      // Vertical angle from SNR to target
      const targetVerticalAngle = (targetHeightOffset / targetDistance);
      const isCapturedByVerticalAngle =
        Math.abs(this.verticalAngle - targetVerticalAngle) <
          Math.abs(targetSpotAngle);
      if (isCapturedByAzimut && isCapturedByVerticalAngle) {
        this.trackTargetByDirection(flightObject);
        this.eventListener &&
          this.eventListener("isCapturedByDirection", true);
      }
    });
  }

  resetCaptureTargetByDirection() {
    this.trackTargetInterval && clearInterval(this.trackTargetInterval);
    this.trackTargetInterval = null;
    this.trackingTargetIdentifier = null;
    this.eventListener && this.eventListener("isCapturedByDirection", false);
    this.resetCaptureTargetByDistance();
  }

  private drawDistanceScreenSnow() {
    if (!this.distanceRadarCanvasContext) return;
    for (let i = 0; i < 500; i++) {
      const pointX = this.distanceRadarCanvasContext.canvas.width *
        Math.random();
      const pointY = this.distanceRadarCanvasContext.canvas.height *
        Math.random();
      this.distanceRadarCanvasContext.beginPath();
      this.distanceRadarCanvasContext.fillStyle = `rgba(184, 134, 11,${
        1 - Math.random()
      })`;
      this.distanceRadarCanvasContext.arc(
        pointX,
        pointY,
        2,
        0,
        Math.PI * 2,
      );
      this.distanceRadarCanvasContext.fill();
    }
  }

  private drawDistanceScreenSite() {
    if (!this.distanceRadarCanvasContext) return;
    const ctx = this.distanceRadarCanvasContext;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    const maxDistance = this.maxDistance * this.scale;
    const step = 10 * this.scale;
    for (let distance = 0; distance <= maxDistance; distance += step) {
      const pointY = ctx.canvas.height /
        (maxDistance / distance);
        ctx.beginPath();
        ctx.moveTo(0, pointY);
        ctx.lineTo(20, pointY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
          ctx.canvas.width - 20,
        pointY,
      );
      ctx.lineTo(
        ctx.canvas.width,
        pointY,
      );
      ctx.stroke();
      ctx.fillText(
        (maxDistance - distance).toString(),
        5,
        pointY + 15,
      );
    }

    ctx.strokeStyle = "red";
    const pointY1 = ctx.canvas.height -
    ctx.canvas.height *
        ((this.targetDistance - this.distanceDetectRange) /
          (this.maxDistance * this.scale));

    const pointY2 = ctx.canvas.height -
    ctx.canvas.height *
        ((this.targetDistance + this.distanceDetectRange) /
          (this.maxDistance * this.scale));

          ctx.beginPath();
          ctx.moveTo(0, pointY1);
          ctx.lineTo(
            ctx.canvas.width,
      pointY1,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pointY2);
    ctx.lineTo(
      ctx.canvas.width,
      pointY2,
    );
    ctx.stroke();

    // Draw redline
    const redlineY = ctx.canvas.height -
    ctx.canvas.height /
        (maxDistance / this.missileMaxDistance);
        ctx.fillStyle = `rgba(255, 0, 0,1)`;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, redlineY);
        ctx.lineTo(
          ctx.canvas.width,
      redlineY,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawDistanceScreenTargets(
    targetDistance: number,
    canvasDistanceSpotWidth: number,
    canvasDistanceSpotLength: number,
    targetVisibilityK: number,
    velocity: number,
  ) {
    if (!this.distanceRadarCanvasContext) return;
    const ctx = this.distanceRadarCanvasContext;
    const maxDistance = this.maxDistance * this.scale;
    const canvasCenterX = ctx.canvas.width / 2;
    const pointY = ctx.canvas.height -
    ctx.canvas.height /
        (maxDistance / targetDistance);
        ctx.fillStyle = `rgba(184, 134, 11,${
      1 - targetVisibilityK
    })`;
    ctx.beginPath();
    ctx.ellipse(
      canvasCenterX,
      pointY,
      canvasDistanceSpotLength / 2,
      canvasDistanceSpotWidth / 2,
      Math.PI / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (this.trackTargetDistanceInterval) {
      // Draw point of missile hit
      const timeToHit = targetDistance /
        ((velocity + this.missileVelocity) / 1000);
      const distanceToHit = (timeToHit * this.missileVelocity) / 1000;
      const missileHitY = ctx.canvas.height -
      ctx.canvas.height /
          (maxDistance / distanceToHit);

          ctx.fillStyle = `rgba(255, 0, 0,1)`;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(0, missileHitY);
          ctx.lineTo(
            ctx.canvas.width,
        missileHitY,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  get indicatorTargetDistance() {
    return this.targetDistance;
  }

  setIndicatorTargetDistance(distance: number) {
    if (distance > 0 && distance < this.maxDistance) {
      this.targetDistance = distance;
    }
  }

  captureTargetByDistance() {
    this.flightObjects.forEach((flightObject) => {
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      if (
        Math.abs(targetDistance - this.targetDistance) <
          this.distanceDetectRange &&
        this.trackingTargetIdentifier === flightObject.identifier
      ) {
        this.trackTargetByDistance();
        this.eventListener &&
          this.eventListener("isCapturedByDistance", true);
      }
    });
  }

  resetCaptureTargetByDistance() {
    this.trackTargetDistanceInterval &&
      clearInterval(this.trackTargetDistanceInterval);
    this.trackTargetDistanceInterval = null;
    this.eventListener && this.eventListener("isCapturedByDistance", false);
  }

  private trackTargetByDistance() {
    this.trackTargetDistanceInterval &&
      clearInterval(this.trackTargetDistanceInterval);

    const flightObject = this.flightObjects.find((flightObject) =>
      flightObject.identifier === this.trackingTargetIdentifier
    )!;
    this.trackTargetDistanceInterval = setInterval(() => {
      // Distance from SNR to target
      const targetDistance = Math.hypot(
        flightObject.currentPoint.x,
        flightObject.currentPoint.y,
      );

      if (
        targetDistance > this.maxDistance
      ) {
        this.resetCaptureTargetByDirection();
        this.resetCaptureTargetByDistance();
      }

      this.targetDistance = targetDistance;
    }, 0);
  }

  addMissile(missile: SAMissile) {
    this.missiles.push(missile);
  }

  private calculateMissiles() {
    for (let missile of this.missiles) {
      if (!missile.isDestroyedMissile) {
        // Distance from SNR to missile
        const missileDistance = Math.hypot(
          missile.missileCurrentPoint.x,
          missile.missileCurrentPoint.y,
        );
        // Azimut from SNR to target
        const missileAzimutAngle = Math.atan2(
          missile.missileCurrentPoint.y,
          missile.missileCurrentPoint.x,
        );
        // Difference from SNR and target heights
        const missileHeightOffset = missile.missileCurrentPoint.z -
          this.radarHeight / 1000;
        // Vertical angle from SNR to target
        const missileVerticalAngle = (missileHeightOffset / missileDistance);

        // Angle of ray of SNR
        const rayWidthRad = this.rayWidth * Math.PI / 180;
        // Difference of SNR azimut and target azimut
        const missileAzimutOffset = this.azimut - missileAzimutAngle;
        // Difference of SNR vertical angle and target vertical angle
        const missileVerticalOffset = missileVerticalAngle -
          this.verticalAngle;
        // Calculate target position on canvas
        const canvasX = -(missileAzimutOffset / rayWidthRad * 2) *
            this.targetRadarCanvasCenter.x + this.targetRadarCanvasCenter.x;
        const canvasY = -(missileVerticalOffset / rayWidthRad * 2) *
            this.targetRadarCanvasCenter.y + this.targetRadarCanvasCenter.y;
        this.drawMissilesOnTargetScreen(canvasX, canvasY);
        this.drawMissilesOnDistanceScreen(missileDistance);
      }
    }
  }

  private drawMissilesOnTargetScreen(canvasX: number, canvasY: number) {
    if (!this.targetRadarCanvasContext) return;
    const ctx = this.targetRadarCanvasContext
    ctx.fillStyle = `rgba(255, 0, 0,1)`;
    ctx.beginPath();
    ctx.arc(
      canvasX,
      canvasY,
      5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  private drawMissilesOnDistanceScreen(missileDistance: number) {
    if (!this.distanceRadarCanvasContext) return;
    const ctx = this.distanceRadarCanvasContext
    const maxDistance = this.maxDistance * this.scale;
    const canvasCenterX = ctx.canvas.width / 2;
    const pointY = ctx.canvas.height -
    ctx.canvas.height /
        (maxDistance / missileDistance);
        ctx.fillStyle = `rgba(255, 0, 0,1)`;
        ctx.beginPath();
        ctx.arc(
      canvasCenterX,
      pointY,
      5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
