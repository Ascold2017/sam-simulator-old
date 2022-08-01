interface ISNRTargetParamsScreen {
  indicatorsCanvas: HTMLCanvasElement;
  maxHeight: number;
  maxVelocity: number;
  killZoneDistance: number;
}

export default class SNRTargetParamsScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private params: Record<string, number> = {
    targetVelocity: 0,
    targetParam: 0,
    targetHeight: 0,
  };
  private maxHeight = 0;
  private maxVelocity = 0;
  private killZoneDistance = 0;
  constructor(
    { indicatorsCanvas, maxHeight, maxVelocity, killZoneDistance }:
      ISNRTargetParamsScreen,
  ) {
    this.ctx = indicatorsCanvas.getContext("2d");
    this.maxHeight = maxHeight;
    this.maxVelocity = maxVelocity;
    this.killZoneDistance = killZoneDistance;
    this.draw();
  }

  private draw() {
    requestAnimationFrame(this.draw.bind(this));
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawIndicator({
      center: { x: 100, y: 100 },
      label: "H, км",
      value: this.params.targetHeight / this.maxHeight,
      maxValue: this.maxHeight,
      labelStep: 5,
      strokesStep: 6,
    });
    this.drawIndicator({
      center: { x: 300, y: 100 },
      label: "V, м/с",
      value: this.params.targetVelocity / this.maxVelocity,
      maxValue: this.maxVelocity,
      labelStep: 5,
      strokesStep: 6,
    });
    this.drawIndicator({
      center: { x: 500, y: 100 },
      label: "Р, км",
      value: this.params.targetParam / (this.killZoneDistance + 5),
      maxValue: this.killZoneDistance + 5,
      labelStep: 5,
      strokesStep: 6,
    });
  }

  private drawIndicator({
    center,
    label,
    value,
    maxValue,
    labelStep,
    strokesStep,
  }: {
    center: { x: number; y: number };
    label: string;
    value: number;
    maxValue: number;
    labelStep: number;
    strokesStep: number;
  }) {
    if (!this.ctx) return;
    const radius = 85;
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    // Draw radial strokes
    for (let deg = -90; deg <= 90; deg += strokesStep) {
      const radians = deg * Math.PI / 180 - Math.PI / 2;
      const lineLength = deg % 5 === 0 ? 8 : 5;

      const innerX = center.x +
        (radius - lineLength) * Math.cos(radians);
      const innerY = center.y +
        (radius - lineLength) * Math.sin(radians);
      const outerX = center.x +
        radius * Math.cos(radians);
      const outerY = center.y +
        radius * Math.sin(radians);

      this.ctx.beginPath();
      this.ctx.moveTo(innerX, innerY);
      this.ctx.lineTo(outerX, outerY);
      this.ctx.stroke();
      // Draw labels
      if (deg % labelStep === 0) {
        this.ctx.save();
        this.ctx.translate(outerX, outerY);
        this.ctx.rotate(radians + Math.PI / 2);
        this.ctx.textAlign = "center";
        this.ctx.font = "9px Russo One, sans-serif";
        this.ctx.fillText(
          (maxValue * (radians + Math.PI) / Math.PI)
            .toLocaleString(),
          0,
          -5,
        );
        this.ctx.restore();
      }
    }
    // Draw indicator
    this.ctx.strokeStyle = "red";
    const stringLength = 50;
    const valueRad = Math.PI + (Math.PI * value);
    const innerX = center.x +
      (radius - stringLength) * Math.cos(valueRad);
    const innerY = center.y +
      (radius - stringLength) * Math.sin(valueRad);
    const outerX = center.x +
      radius * Math.cos(valueRad);
    const outerY = center.y +
      radius * Math.sin(valueRad);

    this.ctx.beginPath();
    this.ctx.moveTo(innerX, innerY);
    this.ctx.lineTo(outerX, outerY);
    this.ctx.stroke();
    this.ctx.textAlign = "center";
    this.ctx.font = "12px Russo One, sans-serif";
    this.ctx.strokeStyle = "white";
    this.ctx.fillText(label, center.x, center.y);
  }

  setParam(paramName: string, paramValue: number) {
    this.params[paramName] = paramValue;
  }
}
