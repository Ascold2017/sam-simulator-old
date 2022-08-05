import type FlightObject from "./FlightObject";
interface ISOC {
  scale: number;
  canvasRadar: HTMLCanvasElement;
  rayWidth: number;
}
export default class SOCScreen {
  private scale = 1;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private canvasScale = 3;
  private targets: Record<string, any> = {};
  private rayWidth = 0;
  private maxLocateDistance = 100;
  private targetRayAngle = -Math.PI / 2;
  private distanceDetectAccuracy = 0.2; // km
  private azimutDetectAccuracy = 1; // deg
  private currentRotation = 0;
  private gain = 2;
  isEnabled = false;
  constructor({
    scale,
    canvasRadar,
    rayWidth, // in degrees
  }: ISOC) {
    this.ctx = canvasRadar.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    this.scale = scale;
    this.rayWidth = rayWidth;

    this.draw();
  }

  setTargetRayAngle(value: number) {
    this.targetRayAngle = value;
  }

  setScale(value: number) {
    this.scale = value;
  }

  public setTargetParams(
    targetIdentifier: string,
    targetDistance: number,
    targetSize: number,
    targetX: number,
    targetY: number,
  ) {
    this.targets[targetIdentifier] = {
      targetDistance,
      targetSize,
      targetX,
      targetY,
    };
  }

  public removeTarget(targetIdentifier: string) {
    delete this.targets[targetIdentifier];
  }

  private draw() {
    requestAnimationFrame(this.draw.bind(this));
    this.ctx!.clearRect(
      0,
      0,
      this.ctx!.canvas.width,
      this.ctx!.canvas.height,
    );
    this.drawBackground();
    if (this.isEnabled) {
      this.drawSnow();
      this.drawTargets();
      this.rotateAntenna();
    }
    this.drawRadarSite();
    this.drawTargetRay();
  }

  private rotateAntenna() {
    this.currentRotation = 2 * Math.PI * ((+new Date() % 10000) / 10000);
    this.ctx!.strokeStyle = "rgba(150, 249, 123,1)";
    this.ctx!.beginPath();
    this.ctx!.moveTo(
      this.canvasCenter.x,
      this.canvasCenter.y,
    );
    const radius = this.maxLocateDistance * this.canvasScale;
    this.ctx!.lineTo(
      radius *
          Math.cos(this.currentRotation) + this.canvasCenter.x,
      radius *
          Math.sin(this.currentRotation) + this.canvasCenter.y,
    );
    this.ctx!.stroke();
  }

  private drawBackground() {
    if (!this.ctx) return;
    this.ctx?.beginPath();
    this.ctx.fillStyle = this.isEnabled ? "rgb(15, 33, 19)" : "black";
    this.ctx?.arc(
      this.canvasCenter.x,
      this.canvasCenter.y,
      this.ctx.canvas.width / 2 - 25,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }

  private drawRadarSite() {
    const centerOfCanvas = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    this.ctx!.fillStyle = "red";

    this.ctx!.beginPath();
    this.ctx!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      2,
      0,
      Math.PI * 2,
    );
    this.ctx!.fill();

    this.ctx!.strokeStyle = "white";
    this.ctx!.beginPath();
    this.ctx!.arc(
      centerOfCanvas.x,
      centerOfCanvas.y,
      this.canvasCenter.x - 25,
      0,
      2 * Math.PI,
    );
    this.ctx!.stroke();

    if (this.isEnabled) {
      // Draw 25 km circle killzone
      this.ctx!.strokeStyle = "red";
      this.ctx!.beginPath();
      this.ctx!.arc(
        centerOfCanvas.x,
        centerOfCanvas.y,
        25 / this.scale * this.canvasScale,
        0,
        2 * Math.PI,
      );
      this.ctx!.stroke();

      this.ctx!.strokeStyle = "white";
      // Draw 30 km circle
      if (this.scale === 0.3) {
        this.ctx!.beginPath();
        this.ctx!.arc(
          centerOfCanvas.x,
          centerOfCanvas.y,
          30 / this.scale * this.canvasScale,
          0,
          2 * Math.PI,
        );
        this.ctx!.stroke();
      }
      // Draw 50 km circle
      this.ctx!.beginPath();
      this.ctx!.arc(
        centerOfCanvas.x,
        centerOfCanvas.y,
        50 / this.scale * this.canvasScale,
        0,
        2 * Math.PI,
      );
      this.ctx!.stroke();
      // Draw 100 km circle
      this.ctx!.beginPath();
      this.ctx!.arc(
        centerOfCanvas.x,
        centerOfCanvas.y,
        100 / this.scale * this.canvasScale,
        0,
        2 * Math.PI,
      );
      this.ctx!.stroke();
    }

    // Draw radial lines and degrees
    for (let deg = 0; deg < 360; deg += 5) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;
      const isEvery10 = deg % 10 === 0;

      const innerX = centerOfCanvas.x +
        (this.ctx!.canvas.width / 2 - (isEvery10 ? 40 : 30)) *
          Math.cos(radians);
      const innerY = centerOfCanvas.y +
        (this.ctx!.canvas.width / 2 - (isEvery10 ? 40 : 30)) *
          Math.sin(radians);
      const outerX = centerOfCanvas.x +
        (this.ctx!.canvas.width / 2 - 25) *
          Math.cos(radians);
      const outerY = centerOfCanvas.y +
        (this.ctx!.canvas.width / 2 - 25) *
          Math.sin(radians);
      if (this.isEnabled) {
        this.ctx!.beginPath();
        this.ctx!.moveTo(innerX, innerY);
        this.ctx!.lineTo(outerX, outerY);
        this.ctx!.stroke();
      }
      if (isEvery10) {
        this.ctx!.font = "14px Russo One, sans-serif";
        this.ctx!.fillStyle = "white";
        this.ctx!.save();
        this.ctx!.translate(outerX, outerY);
        this.ctx!.rotate(radians + Math.PI / 2);
        this.ctx!.textAlign = "center";
        this.ctx!.fillText(deg.toString(), 0, -5);
        this.ctx!.restore();
      }
    }
  }

  private drawTargets() {
    if (!this.ctx) return;

    Object.keys(this.targets).forEach((identifier) => {
      const targetParams = this.targets[identifier];
      const canvasDistance = targetParams.targetDistance * this.canvasScale /
        this.scale;
      if (
        !this.ctx ||
        targetParams.targetDistance > this.maxLocateDistance * this.scale
      ) {
        return;
      }

      this.ctx.beginPath();
      const targetAngle = Math.atan2(
        targetParams.targetY,
        targetParams.targetX,
      );
      const targetAzimutSize = (targetParams.targetSize / 2 * Math.PI +
        this.azimutDetectAccuracy * (Math.PI / 180) * 2) * this.gain;
      const targetDistanceSize = this.distanceDetectAccuracy * this.gain /
        this.scale *
        this.canvasScale;

      const targetVisibilityK = 1 / (targetParams.targetDistance /
        this.maxLocateDistance);
      this.ctx.strokeStyle = `rgba(150, 249, 123,${targetVisibilityK})`;
      this.ctx.lineWidth = targetDistanceSize;
      this.ctx.arc(
        this.canvasCenter.x,
        this.canvasCenter.y,
        canvasDistance,
        targetAngle - targetAzimutSize / 2,
        targetAngle + targetAzimutSize / 2,
      );
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
    });
  }

  private drawSnow() {
    for (let i = 0; i < 500; i++) {
      const distanceFromCenter = this.maxLocateDistance * this.canvasScale *
        Math.random();

      const angle = Math.PI * 2 * Math.random();
      const snowWidth = 1 * Math.PI / 180;
      this.ctx!.beginPath();
      this.ctx!.arc(
        this.canvasCenter.x,
        this.canvasCenter.y,
        distanceFromCenter,
        angle,
        angle + snowWidth,
      );
      const k = distanceFromCenter /
        (this.maxLocateDistance * this.canvasScale);
      this.ctx!.strokeStyle = `rgba(150, 249, 123,${1 - k})`;
      this.ctx!.stroke();
    }
  }

  private drawTargetRay() {
    this.ctx!.strokeStyle = "rgba(255,0,0,1)";
    this.ctx!.beginPath();
    this.ctx!.moveTo(
      this.canvasCenter.x,
      this.canvasCenter.y,
    );
    const radius = this.maxLocateDistance * this.canvasScale;
    this.ctx!.lineTo(
      radius *
          Math.cos(this.targetRayAngle) + this.canvasCenter.x,
      radius *
          Math.sin(this.targetRayAngle) + this.canvasCenter.y,
    );
    this.ctx!.stroke();
  }
}
