export default class SNRDistanceScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private targets: Record<string, any> = {};
  private missiles: Record<string, any> = {};
  private distance = 0;
  private scale = 1;
  private maxDistance = 0;
  private maxKillZoneDistance = 0;
  private distanceDetectRange = 0;
  private trackingDistanceTargetIdentifier: string | null = null;
  private canvasPadding = 10;
  isEnabled = false;
  constructor(
    canvas: HTMLCanvasElement,
    maxDistance: number,
    distanceDetectRange: number,
    initialDistance: number,
    maxKillZoneDistance: number,
  ) {
    this.ctx = canvas.getContext("2d");
    this.maxDistance = maxDistance;
    this.distanceDetectRange = distanceDetectRange;
    this.distance = initialDistance;
    this.maxKillZoneDistance = maxKillZoneDistance;
    this.drawScreen();
  }

  public setTrackingTargetByDistance(identifier: string | null) {
    this.trackingDistanceTargetIdentifier = identifier;
  }

  public setTargetParams(
    targetIdentifier: string,
    targetDistanceK: number,
    targetOffsetX: number,
    distance: number,
    spotWidth: number,
    spotLength: number,
    distanceToHit: number,
    targetParam: number,
  ) {
    this.targets[targetIdentifier] = {
      targetOffsetX,
      targetDistanceK,
      distance,
      spotWidth,
      spotLength,
      distanceToHit,
      targetParam,
    };
  }

  public setMissileParams(missileIdentifier: string, missileDistance: number) {
    this.missiles[missileIdentifier] = { missileDistance };
  }

  get screenScale() {
    return this.scale;
  }

  public setScale(scale: number) {
    this.scale = scale;
  }

  public setDistance(distance: number) {
    this.distance = distance;
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
      this.drawDistanceScreenSnow();
      this.drawDistanceScreenTargets();
      this.drawDistanceScreenMissiles();
      this.drawDistanceScreenSite();
    }
  }

  private drawBackground() {
    if (!this.ctx) return;
    this.ctx?.beginPath();
    this.ctx.fillStyle = this.isEnabled ? "rgba(184, 134, 11, 0.1)" : "black";
    this.ctx?.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private drawDistanceScreenSnow() {
    if (!this.ctx) return;
    for (let i = 0; i < 200; i++) {
      const pointX = this.ctx.canvas.width *
        Math.random();
      const pointY = this.ctx.canvas.height *
        Math.random();
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(184, 134, 11,${1 - Math.random()})`;
      this.ctx.rect(
        pointX,
        pointY,
        2,
        2,
      );
      this.ctx.fill();
    }
  }

  private drawDistanceScreenSite() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    const maxDistance = this.maxDistance * this.scale;
    for (let distance = 0; distance <= maxDistance; distance += 1) {
      const pointX = (ctx.canvas.width - this.canvasPadding * 2) /
          (maxDistance / distance) + this.canvasPadding;
      const isEvery5 = distance % 5 === 0;
      const isEvery10 = distance % 10 === 0;
      ctx.beginPath();
      ctx.moveTo(pointX, 15);
      ctx.lineTo(pointX, isEvery5 ? 35 : 25);
      ctx.stroke();
      if (this.scale === 1 ? isEvery10 : isEvery5) {
        ctx.font = "12px Russo One, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          (distance).toString(),
          pointX,
          12,
        );
      }
    }

    if (this.isEnabled) {
      ctx.strokeStyle = "red";
      const pointX1 = (ctx.canvas.width - this.canvasPadding * 2) *
          ((this.distance - this.distanceDetectRange) /
            (this.maxDistance * this.scale)) + this.canvasPadding;

      const pointX2 = (ctx.canvas.width - this.canvasPadding * 2) *
          ((this.distance + this.distanceDetectRange) /
            (this.maxDistance * this.scale)) + this.canvasPadding;

      ctx.beginPath();
      ctx.moveTo(pointX1, 15);
      ctx.lineTo(
        pointX1,
        ctx.canvas.height,
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pointX2, 15);
      ctx.lineTo(
        pointX2,
        ctx.canvas.height,
      );
      ctx.stroke();

      // Draw redline
      const redlineX1 = (ctx.canvas.width - this.canvasPadding * 2) /
          (maxDistance / this.maxKillZoneDistance) + this.canvasPadding;
      ctx.fillStyle = `rgba(255, 0, 0,1)`;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(redlineX1, 15);
      ctx.lineTo(
        redlineX1,
        ctx.canvas.height,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawTarget(
    canvasPointX: number,
    vertexHeightK: number,
    vertexWidth: number,
    color: string,
  ) {
    if (!this.ctx) return;
    const heightOffset = this.ctx.canvas.height -
      (this.ctx.canvas.height - 100) * vertexHeightK;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.bezierCurveTo(
      canvasPointX - vertexWidth,
      this.ctx.canvas.height,
      canvasPointX,
      this.ctx.canvas.height,
      canvasPointX,
      heightOffset,
    );
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.bezierCurveTo(
      canvasPointX,
      heightOffset,
      canvasPointX,
      this.ctx.canvas.height,
      canvasPointX + vertexWidth,
      this.ctx.canvas.height,
    );
    this.ctx.stroke();
  }

  private drawDistanceScreenTargets() {
    Object.keys(this.targets).forEach((targetIdentifier) => {
      if (!this.ctx) return;
      const targetParams = this.targets[targetIdentifier];
      const maxDistance = this.maxDistance * this.scale;

      const pointX = (this.ctx.canvas.width - this.canvasPadding * 2) /
          (maxDistance / targetParams.distance) + this.canvasPadding;

      this.drawTarget(
        pointX,
        1 - targetParams.targetDistanceK,
        targetParams.spotLength /
          this.scale,
        "rgba(184, 134, 11,1)",
      );
      if (targetIdentifier === this.trackingDistanceTargetIdentifier) {
        // Draw line of missile hit
        const missileHitX = (this.ctx.canvas.width - this.canvasPadding * 2) /
            (maxDistance / targetParams.distanceToHit) + this.canvasPadding;

        this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(missileHitX, 15);
        this.ctx.lineTo(
          missileHitX,
          this.ctx.canvas.height,
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw redline of minimal kill range
        const redlineX2 = (this.ctx.canvas.width - this.canvasPadding * 2) /
            (maxDistance / targetParams.targetParam) + this.canvasPadding;
        this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(redlineX2, 15);
        this.ctx.lineTo(
          redlineX2,
          this.ctx.canvas.height,
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    });
  }

  private drawDistanceScreenMissiles() {
    Object.keys(this.missiles).forEach((missileIdentifier) => {
      if (!this.ctx) return;
      const missileParams = this.missiles[missileIdentifier];
      if (!this.ctx) return;
      const maxDistance = this.maxDistance * this.scale;
      const pointX = (this.ctx.canvas.width - this.canvasPadding * 2) /
          (maxDistance / missileParams.missileDistance) + this.canvasPadding;
      this.drawTarget(
        pointX,
        0.25,
        0.5,
        `rgba(255, 0, 0,1)`,
      );
    });
  }
}
