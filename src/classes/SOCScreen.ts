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
    if (this.isEnabled) {
      this.drawSnow();
      this.drawTargets();
    }

    this.drawRadarSite();
    this.drawTargetRay();
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

    // Draw radial lines and degrees
    for (let deg = 0; deg < 360; deg += 5) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;
      const map: Record<number, { start: number; end: number }> = {
        1: { start: 30, end: 100 },
        0.5: { start: 30, end: 50 },
        0.3: { start: 20, end: 30 },
      };
      const linesDistances = map[this.scale];
      const innerX = centerOfCanvas.x +
        ((linesDistances.start / this.scale) * this.canvasScale) *
          Math.cos(radians);
      const innerY = centerOfCanvas.y +
        ((linesDistances.start / this.scale) * this.canvasScale) *
          Math.sin(radians);
      const outerX = centerOfCanvas.x +
        ((linesDistances.end / this.scale) * this.canvasScale) *
          Math.cos(radians);
      const outerY = centerOfCanvas.y +
        ((linesDistances.end / this.scale) * this.canvasScale) *
          Math.sin(radians);

      this.ctx!.beginPath();
      this.ctx!.moveTo(innerX, innerY);
      this.ctx!.lineTo(outerX, outerY);
      this.ctx!.stroke();
      this.ctx!.font = "12px Russo One, sans-serif";
      this.ctx!.fillStyle = "white";
      this.ctx!.save();
      this.ctx!.translate(outerX, outerY);
      this.ctx!.rotate(radians + Math.PI / 2);
      this.ctx!.textAlign = "center";
      this.ctx!.fillText(deg.toString(), 0, -5);
      this.ctx!.restore();
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
      // Angle of ray of SOC
      const rayWidthRad = this.rayWidth * Math.PI / 180;
      const rayWidth =
        ((Math.PI * rayWidthRad * targetParams.targetDistance) / 180);
      const targetSpotSize = targetParams.targetSize / rayWidth * 10;
      const targetVisibilityK = targetParams.targetDistance /
        this.maxLocateDistance;
      this.ctx.strokeStyle = `rgba(184, 134, 11,${1 - targetVisibilityK})`;
      this.ctx.arc(
        this.canvasCenter.x,
        this.canvasCenter.y,
        canvasDistance,
        targetAngle - targetSpotSize / 2,
        targetAngle + targetSpotSize / 2,
      );
      this.ctx.stroke();
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
      this.ctx!.strokeStyle = `rgba(184, 134, 11,${1 - k})`;
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
