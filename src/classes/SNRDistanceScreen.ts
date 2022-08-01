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
    this.drawDistanceScreenSnow();
    this.drawDistanceScreenTargets();
    this.drawDistanceScreenMissiles();
    this.drawDistanceScreenSite();
  }

  private drawDistanceScreenSnow() {
    if (!this.ctx) return;
    for (let i = 0; i < 500; i++) {
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
        ((this.distance - this.distanceDetectRange) /
          (this.maxDistance * this.scale));

    const pointY2 = ctx.canvas.height -
      ctx.canvas.height *
        ((this.distance + this.distanceDetectRange) /
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
    const redlineY1 = ctx.canvas.height -
      ctx.canvas.height /
        (maxDistance / this.maxKillZoneDistance);
    ctx.fillStyle = `rgba(255, 0, 0,1)`;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, redlineY1);
    ctx.lineTo(
      ctx.canvas.width,
      redlineY1,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawDistanceScreenTargets() {
    Object.keys(this.targets).forEach((targetIdentifier) => {
      if (!this.ctx) return;
      const targetParams = this.targets[targetIdentifier];
      const maxDistance = this.maxDistance * this.scale;
      const canvasCenterX = this.ctx.canvas.width / 2;
      const pointX = targetParams.targetOffsetX *
          canvasCenterX +
        canvasCenterX;
      const pointY = this.ctx.canvas.height -
        this.ctx.canvas.height /
          (maxDistance / targetParams.distance);
      const canvasDistanceSpotWidth = this.ctx.canvas.width *
        targetParams.spotWidth;
      const canvasDistanceSpotLength = (this.ctx.canvas.width *
        targetParams.spotLength /
        this.scale);
      this.ctx.fillStyle = `rgba(184, 134, 11,${
        1 - targetParams.targetDistanceK
      })`;
      this.ctx.beginPath();
      this.ctx.ellipse(
        pointX,
        pointY,
        canvasDistanceSpotLength / 2,
        canvasDistanceSpotWidth / 2,
        Math.PI / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      if (targetIdentifier === this.trackingDistanceTargetIdentifier) {
        // Draw line of missile hit
        const missileHitY = this.ctx.canvas.height -
          this.ctx.canvas.height /
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

        // Draw redline of minimal kill range
        const redlineY2 = this.ctx.canvas.height -
          this.ctx.canvas.height /
            (maxDistance / targetParams.targetParam);
        this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, redlineY2);
        this.ctx.lineTo(
          this.ctx.canvas.width,
          redlineY2,
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
      const canvasCenterX = this.ctx.canvas.width / 2;
      const pointY = this.ctx.canvas.height -
        this.ctx.canvas.height /
          (maxDistance / missileParams.missileDistance);
      this.ctx.strokeStyle = `rgba(255, 0, 0,1)`;
      this.ctx.lineWidth = 4;
      this.ctx.setLineDash([4, 1]);
      this.ctx.beginPath();
      this.ctx.moveTo(canvasCenterX - 8, pointY);
      this.ctx.lineTo(canvasCenterX + 8, pointY);
      this.ctx.lineTo(canvasCenterX + 8, pointY - 8);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([]);
    });
  }
}
