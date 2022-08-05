interface ISNRTargetScreen {
  canvas: HTMLCanvasElement;
  initialAngle: number;
  maxDistance: number;
  maxKillZoneDistance: number;
}

interface ITargetParams {
  identifier: string;
  targetVisibilityK: number;
  targetSpotWidth: number;
  targetSpotLength: number;
  targetOffset: number;
  targetDistance: number;
  distanceToHit: number;
}

export default class SNRTargetScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private targets: Record<string, any> = {};
  private missiles: Record<string, any> = {};
  private angle = 0; // rad
  private distance = 0;
  private scale = 1;
  private maxDistance = 0;
  private maxKillZoneDistance = 0;
  private trackingDistanceTargetIdentifier: string | null = null;
  private gain = 10;
  isEnabled = false;
  constructor(
    { canvas, initialAngle, maxDistance, maxKillZoneDistance }:
      ISNRTargetScreen,
  ) {
    this.ctx = canvas.getContext("2d");
    this.canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    this.angle = initialAngle;
    this.maxDistance = maxDistance;
    this.maxKillZoneDistance = maxKillZoneDistance;
    this.drawScreen();
  }

  setDistance(value: number) {
    this.distance = value;
  }

  setAngle(value: number) {
    this.angle = value;
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  public setTrackingTargetByDistance(identifier: string | null) {
    this.trackingDistanceTargetIdentifier = identifier;
  }

  public setTargetParams({
    identifier,
    targetVisibilityK,
    targetSpotWidth,
    targetSpotLength,
    targetOffset,
    targetDistance,
    distanceToHit,
  }: ITargetParams) {
    this.targets[identifier] = {
      targetVisibilityK,
      targetSpotWidth,
      targetSpotLength,
      targetOffset,
      targetDistance,
      distanceToHit,
    };
  }
  public setMissileParams(
    missileIdentifier: string,
    missileOffset: number,
    missileDistance: number,
  ) {
    this.missiles[missileIdentifier] = {
      missileOffset,
      missileDistance,
    };
  }
  public removeTarget(targetIdentifier: string) {
    delete this.targets[targetIdentifier];
  }
  public removeMissile(missileIdentifier: string) {
    delete this.missiles[missileIdentifier];
  }

  private drawScreen() {
    if (!this.ctx) return;
    requestAnimationFrame(this.drawScreen.bind(this));

    this.ctx.clearRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height,
    );
    this.ctx.clearRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height,
    );
    this.drawBackground();
    if (this.isEnabled) {
      this.drawTargetScreenSnow();
      this.drawTargetScreenTargets();
      this.drawMissiles();
      this.drawTargetScreenSite();
    }
  }

  private drawBackground() {
    if (!this.ctx) return;
    this.ctx?.beginPath();
    this.ctx.fillStyle = this.isEnabled ? "rgb(15, 33, 19)" : "black";
    this.ctx?.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private drawTargetScreenSnow() {
    if (!this.ctx) return;
    for (let i = 0; i < 500; i++) {
      const pointX = this.ctx.canvas.width * Math.random();
      const pointY = this.ctx.canvas.height * Math.random();
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(150, 249, 123,${1 - Math.random()})`;
      this.ctx.rect(
        pointX,
        pointY,
        2,
        2,
      );
      this.ctx.fill();
    }
  }

  private drawTargetScreenSite() {
    if (!this.ctx) return;
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Russo One, sans-serif";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvasCenter.x, 0);
    this.ctx.lineTo(this.canvasCenter.x, this.ctx.canvas.height);
    this.ctx.stroke();

    const maxDistance = this.maxDistance * this.scale;
    for (let distance = maxDistance; distance >= 0; distance -= 1) {
      const pointY = (distance / maxDistance) * this.ctx.canvas.height;
      const isEvery5 = distance % 5 === 0;
      const isEvery10 = distance % 10 === 0;

      if (this.scale === 1 ? isEvery10 : isEvery5) {
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, pointY);
        this.ctx.lineTo(this.ctx.canvas.width, pointY);
        this.ctx.stroke();
        this.ctx.fillText(
          (maxDistance - distance).toString(),
          1,
          pointY + 15,
        );
        this.ctx.lineWidth = 1;
      }
    }
    // Distance line
    this.ctx.strokeStyle = "red";
    const pointY = this.ctx.canvas.height - this.ctx.canvas.height *
        (this.distance /
          maxDistance);

    this.ctx.beginPath();
    this.ctx.moveTo(0, pointY);
    this.ctx.lineTo(
      this.ctx.canvas.width,
      pointY,
    );
    this.ctx.stroke();

    // Draw redline
    const redlineY = this.ctx.canvas.height - this.ctx.canvas.height *
        (this.maxKillZoneDistance /
          maxDistance);
    this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, redlineY);
    this.ctx.lineTo(
      this.ctx.canvas.width,
      redlineY,
    );
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawTargetScreenTargets() {
    Object.keys(this.targets).forEach((targetIdentifier) => {
      const targetParams = this.targets[targetIdentifier];
      if (!this.ctx) return;
      const maxDistance = this.maxDistance * this.scale;
      // Calculate target position on canvas
      const canvasX = targetParams.targetOffset *
          this.canvasCenter.x + this.canvasCenter.x;
      const canvasY = this.ctx.canvas.height - this.ctx.canvas.height /
          (maxDistance / targetParams.targetDistance);

      if (!this.ctx) return;
      const canvasSpotSize = this.ctx.canvas.width *
        targetParams.targetSpotWidth * this.gain;
      this.ctx.strokeStyle = `rgba(150, 249, 123,${
        1 - targetParams.targetVisibilityK
      })`;
      this.ctx.lineWidth = this.ctx.canvas.height *
        (targetParams.targetSpotLength / maxDistance) * this.gain;
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX - canvasSpotSize / 2, canvasY);
      this.ctx.lineTo(canvasX + canvasSpotSize / 2, canvasY);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;

      if (targetIdentifier === this.trackingDistanceTargetIdentifier) {
        // Draw line of missile hit
        const missileHitY = this.ctx.canvas.height - this.ctx.canvas.height /
            (maxDistance / targetParams.distanceToHit);

        this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, missileHitY);
        this.ctx.lineTo(
          this.ctx.canvas.width,
          missileHitY,
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    });
  }

  private drawMissiles() {
    Object.keys(this.missiles).forEach((missileIdentifier) => {
      const missileParams = this.missiles[missileIdentifier];
      if (!this.ctx) return;

      const maxDistance = this.maxDistance * this.scale;
      // Calculate target position on canvas
      const canvasX = missileParams.missileOffset *
          this.canvasCenter.x + this.canvasCenter.x;
      const canvasY = this.ctx.canvas.height - this.ctx.canvas.height /
          (maxDistance / missileParams.missileDistance);

      this.ctx.strokeStyle = `rgba(255, 0, 0,1)`;
      this.ctx.lineWidth = 4;
      this.ctx.setLineDash([4, 1]);
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX - 8, canvasY);
      this.ctx.lineTo(canvasX + 8, canvasY);
      this.ctx.lineTo(canvasX + 8, canvasY - 8);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([]);
    });
  }
}
