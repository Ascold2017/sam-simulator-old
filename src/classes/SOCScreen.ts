interface ISOC {
  scale: number;
  distanceDetectRange: number;
  canvasRadar: HTMLCanvasElement;
}
interface ITargetParams {
  identifier: string;
  targetDistance: number;
  targetSize: number;
  targetX: number;
  targetY: number;
  targetRotation: number;
  hitX: number;
  hitY: number;
  isCaptured: boolean;
}

interface IMissileParams {
  identifier: string;
  missileX: number;
  missileY: number;
}
export default class SOCScreen {
  private scale = 1;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private canvasScale = 4;
  private targets: Record<string, ITargetParams> = {};
  private missiles: Record<string, IMissileParams> = {};
  private maxLocateDistance = 100;
  private targetRayAngle = -Math.PI / 2;
  private targetDistance = 0;
  private distanceDetectRange = 1; // km
  private distanceDetectAccuracy = 0.15;
  private azimutDetectAccuracy = 1; // deg
  private currentRotation = 0;
  gain = 1;
  isEnabled = false;
  constructor({
    scale,
    distanceDetectRange,
    canvasRadar,
  }: ISOC) {
    this.ctx = canvasRadar.getContext("2d");
    this.canvasCenter = {
      x: this.ctx!.canvas.width / 2,
      y: this.ctx!.canvas.height / 2,
    };
    this.scale = scale;
    this.distanceDetectRange = distanceDetectRange;
    this.targetDistance = 30;

    this.draw();
  }

  setTargetRayAngle(value: number) {
    this.targetRayAngle = value;
  }

  get distanceScale() {
    return this.scale;
  }

  setScale(value: number) {
    this.scale = value;
  }

  setTargetDistance(value: number) {
    this.targetDistance = value;
  }

  public setTargetParams({
    identifier,
    targetDistance,
    targetSize,
    targetX,
    targetY,
    targetRotation,
    isCaptured,
    hitX,
    hitY,
  }: ITargetParams) {
    this.targets[identifier] = {
      identifier,
      targetDistance,
      targetSize,
      targetX,
      targetY,
      targetRotation,
      isCaptured,
      hitX,
      hitY,
    };
  }

 

  public removeTarget(targetIdentifier: string) {
    delete this.targets[targetIdentifier];
  }

  setMissileParams({ identifier,
    missileX, missileY}: IMissileParams) {
      this.missiles[identifier] = { identifier, missileX, missileY}
    }

    removeMissile(missileIdentifier: string) {
      delete this.missiles[missileIdentifier]
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
      this.drawMissiles();
      // this.rotateAntenna();
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
      const isEvery5 = deg % 5 === 0;

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
      if (isEvery5) {
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

      const canvasTargetX =
        targetParams.targetX * (this.canvasScale / this.scale) +
        this.canvasCenter.x;
      const canvasTargetY =
        targetParams.targetY * (this.canvasScale / this.scale) +
        this.canvasCenter.y;
      const canvasHitX = targetParams.hitX * (this.canvasScale / this.scale) +
      this.canvasCenter.x;;
      const canvasHitY = targetParams.hitY * (this.canvasScale / this.scale) +
      this.canvasCenter.y;;

      // Draw captured target legend
      if (targetParams.isCaptured) {
        this.ctx.strokeStyle = `rgb(150, 249, 123)`;
        this.ctx.beginPath();
        this.ctx.rect(
          canvasTargetX - 10,
          canvasTargetY - 10,
          20,
          20,
        );
        this.ctx.stroke();
        // Draw hit point
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(canvasHitX, canvasHitY, 2, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();
      }
    });
  }

  private drawMissiles() {
   

    Object.keys(this.missiles).forEach((identifier) => {
      const { missileX, missileY } = this.missiles[identifier];
      const canvasX =  missileX * (this.canvasScale / this.scale) +
      this.canvasCenter.x;
      const canvasY =  missileY * (this.canvasScale / this.scale) +
      this.canvasCenter.y;
      if (!this.ctx) return;
      this.ctx.fillStyle = "red";
      this.ctx.beginPath();
      this.ctx.arc(canvasX, canvasY, 2, 0, Math.PI*2)
      this.ctx.fill();
    })
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
    const radiusToTarget = (this.targetDistance - this.distanceDetectRange) *
      this.canvasScale / this.scale;
    const radiusFromTarget = (this.targetDistance + this.distanceDetectRange) *
      this.canvasScale / this.scale;
    const radiusToMaxDistance = (this.maxLocateDistance) *
      this.canvasScale;
    this.ctx!.strokeStyle = "rgba(255,0,0,1)";
    this.ctx!.beginPath();
    this.ctx!.moveTo(
      this.canvasCenter.x,
      this.canvasCenter.y,
    );

    this.ctx!.lineTo(
      radiusToTarget *
          Math.cos(this.targetRayAngle) + this.canvasCenter.x,
      radiusToTarget *
          Math.sin(this.targetRayAngle) + this.canvasCenter.y,
    );
    this.ctx!.stroke();
    this.ctx!.beginPath();
    this.ctx!.moveTo(
      radiusFromTarget *
          Math.cos(this.targetRayAngle) + this.canvasCenter.x,
      radiusFromTarget *
          Math.sin(this.targetRayAngle) + this.canvasCenter.y,
    );

    this.ctx!.lineTo(
      radiusToMaxDistance *
          Math.cos(this.targetRayAngle) + this.canvasCenter.x,
      radiusToMaxDistance *
          Math.sin(this.targetRayAngle) + this.canvasCenter.y,
    );
    this.ctx!.stroke();
  }
}
