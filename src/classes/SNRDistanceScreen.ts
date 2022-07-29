export default class SNRDistanceScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private targets: Record<string, any> = {};
  private missiles: Record<string, any> = {};
  private distance = 0;
  private scale = 1;
  private maxDistance = 0;
  private killZoneDistance = 0;
  private distanceDetectRange = 0;
  constructor(
    canvas: HTMLCanvasElement,
    maxDistance: number,
    distanceDetectRange: number,
    initialDistance: number
  ) {
    this.ctx = canvas.getContext("2d");
    this.canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    this.maxDistance = maxDistance;
    this.distanceDetectRange = distanceDetectRange;
    this.distance = initialDistance;
    this.drawScreen();
  }

  public setTargetParams(
    targetIdentifier: string,
    targetDistanceK: number,
    distance: number,
    spotWidth: number,
    spotLength: number,
  ) {
    this.targets[targetIdentifier] = {
      targetDistanceK,
      distance,
      spotWidth,
      spotLength,
    };
  }

  public setMissileParams(missileIdentifier: string, missileDistance: number) {
    this.missiles[missileIdentifier] = { missileDistance }
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

  public setKillZoneDistance(distance: number) {
    this.killZoneDistance = distance;
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
      this.ctx.arc(
        pointX,
        pointY,
        2,
        0,
        Math.PI * 2,
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
    const redlineY = ctx.canvas.height -
      ctx.canvas.height /
        (maxDistance / this.killZoneDistance);
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

  private drawDistanceScreenTargets() {
    Object.keys(this.targets).forEach((targetIdentifier) => {
      if (!this.ctx) return;
      const targetParams = this.targets[targetIdentifier];
      const maxDistance = this.maxDistance * this.scale;
      const canvasCenterX = this.ctx.canvas.width / 2;
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
        canvasCenterX,
        pointY,
        canvasDistanceSpotLength / 2,
        canvasDistanceSpotWidth / 2,
        Math.PI / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    });

    /*
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
     */
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
          this.ctx.fillStyle = `rgba(255, 0, 0,1)`;
          this.ctx.beginPath();
          this.ctx.arc(
        canvasCenterX,
        pointY,
        5,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    })
    
  }
}
