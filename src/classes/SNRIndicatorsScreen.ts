export default class SNRIndicatorsScreen {
  private ctx: CanvasRenderingContext2D | null = null;
  private minVerticalAngle = 0;
  private maxVerticalAngle = 0;
  private azimut = -Math.PI / 2;
  private verticalAngle = 0;
  constructor(
    indicatorsCanvas: HTMLCanvasElement,
    minVerticalAngle: number,
    maxVerticalAngle: number,
  ) {
    this.ctx = indicatorsCanvas.getContext("2d");
    this.minVerticalAngle = minVerticalAngle;
    this.maxVerticalAngle = maxVerticalAngle;
    this.drawScreen();
  }

  public setAzimut(azimut: number) {
    this.azimut = azimut;
  }

  public setVerticalAngle(angle: number) {
    this.verticalAngle = angle;
  }

  private drawScreen() {
    requestAnimationFrame(this.drawScreen.bind(this));
    if (!this.ctx) return;
    this.ctx.clearRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height,
    );
    this.drawAzimutIndicator();
    this.drawVerticalAngleIndicator();
  }

  private drawAzimutIndicator() {
    if (!this.ctx) return;
    const ctx = this.ctx;

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
    const azimutDeg = (this.azimut + Math.PI / 2) * (180 / Math.PI);
    const azimutDegLabel = Number(azimutDeg < 0 ? azimutDeg + 360 : azimutDeg)
      .toFixed(1);
    const textMeasurements = ctx.measureText(
      azimutDegLabel,
    );
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText(
      azimutDegLabel,
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
    if (!this.ctx) return;
    const ctx = this.ctx;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const offsetY = 10;
    const availableCanvasHeight = canvasHeight - offsetY * 2;
    const totalAngle = Math.abs(this.minVerticalAngle) +
      Math.abs(this.maxVerticalAngle);
    for (
      let deg = this.minVerticalAngle, numOfLine = 1;
      deg <= this.maxVerticalAngle;
      deg += 5, numOfLine++
    ) {
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
    }

    const verticalAngleDeg = this.verticalAngle * (180 / Math.PI);
    const normalizedVerticalAngle = verticalAngleDeg +
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
