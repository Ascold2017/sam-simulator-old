export default class SNRTargetScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasCenter = { x: 0, y: 0 };
  private targets: Record<string, any> = {};
  private missiles: Record<string, any> = {};
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    this.canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    this.drawScreen();
  }

  public setTargetParams(
    targetIdentifier: string,
    targetDistanceK: number,
    targetSpotSize: number,
    targetOffsetX: number,
    targetOffsetY: number,
  ) {
    this.targets[targetIdentifier] = {
      targetDistanceK,
      targetSpotSize,
      targetOffsetX,
      targetOffsetY,
    };
  }
  public setMissileParams(
    missileIdentifier: string,
    missileOffsetX: number,
    missileOffsetY: number,
  ) {
    this.missiles[missileIdentifier] = {
      missileOffsetX,
      missileOffsetY,
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
    this.drawTargetScreenSnow();
    this.drawTargetScreenTargets();
    this.drawMissiles();
    this.drawTargetScreenSite();
  }

  private drawTargetScreenSnow() {
    if (!this.ctx) return;
    const canvasSize = this.ctx.canvas.width;
    for (let i = 0; i < 500; i++) {
      const pointX = canvasSize * Math.random();
      const pointY = canvasSize * Math.random();
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

  private drawTargetScreenSite() {
    if (!this.ctx) return;
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.canvasCenter.x,
      0,
    );
    this.ctx.lineTo(
      this.canvasCenter.x,
      this.ctx.canvas.height,
    );
    this.ctx.stroke();
    this.ctx.moveTo(
      0,
      this.canvasCenter.y,
    );
    this.ctx.lineTo(
      this.ctx.canvas.width,
      this.canvasCenter.y,
    );
    this.ctx.stroke();
  }

  private drawTargetScreenTargets() {
    Object.keys(this.targets).forEach((targetIdentifier) => {
      const targetParams = this.targets[targetIdentifier];
      // Calculate target position on canvas
      const canvasX = targetParams.targetOffsetX *
          this.canvasCenter.x + this.canvasCenter.x;
      const canvasY = targetParams.targetOffsetY *
          this.canvasCenter.y + this.canvasCenter.y;

      if (!this.ctx) return;
      const canvasSpotSize = this.ctx.canvas.width *
        targetParams.targetSpotSize;
      this.ctx.fillStyle = `rgba(184, 134, 11,${
        1 - targetParams.targetDistanceK
      })`;
      this.ctx.beginPath();
      this.ctx.ellipse(
        canvasX,
        canvasY,
        canvasSpotSize / 2,
        canvasSpotSize,
        Math.PI / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    });
  }

  private drawMissiles() {
    Object.keys(this.missiles).forEach((missileIdentifier) => {
      const missileParams = this.missiles[missileIdentifier];
      if (!this.ctx) return;
      const canvasX = missileParams.missileOffsetX * this.ctx.canvas.width +
        this.canvasCenter.x;
      const canvasY = missileParams.missileOffsetY * this.ctx.canvas.height +
        this.canvasCenter.y;
      this.ctx.strokeStyle = `rgba(255, 0, 0,1)`;
      this.ctx.lineWidth = 4;
      this.ctx.setLineDash([4, 1])
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX - 8, canvasY);
      this.ctx.lineTo(canvasX + 8, canvasY);
      this.ctx.lineTo(canvasX + 8, canvasY - 8);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([])
    });
  }
}
