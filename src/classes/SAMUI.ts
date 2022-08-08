import Konva from "konva";

export default class SAMUI {
  private stage: Konva.Stage | null = null;
  constructor(container: HTMLDivElement) {
    this.stage = new Konva.Stage({
      container,
      width: 1420,
      height: 900,
    });
    this.drawSupplyPanel();
    this.drawParamsPanel();
    this.drawTvPanel();
    this.drawSOCPanel();
    this.drawWeaponPanel();
  }

  private drawSupplyPanel() {
    const layer = new Konva.Layer();
    const supplyPanel = new Konva.Rect({
      x: 0,
      y: 0,
      width: 400,
      height: 500,
      fill: "grey",
      shadowBlur: 10,
      cornerRadius: 6,
    });

    layer.add(supplyPanel);
    this.stage?.add(layer);
  }

  private drawParamsPanel() {
    const layer = new Konva.Layer();

    const paramsPanel = new Konva.Rect({
      x: 410,
      y: 0,
      width: 600,
      height: 200,
      fill: "grey",
      shadowBlur: 10,
      cornerRadius: 6,
    });

    layer.add(paramsPanel);
    this.stage?.add(layer);
  }

  private drawTvPanel() {
    const layer = new Konva.Layer();

    const tvPanel = new Konva.Rect({
      x: 1020,
      y: 0,
      width: 400,
      height: 400,
      fill: "grey",
      shadowBlur: 10,
      cornerRadius: 6,
    });

    layer.add(tvPanel);
    this.stage?.add(layer);
  }

  private drawSOCPanel() {
    const layer = new Konva.Layer();

    const socPanel = new Konva.Rect({
      x: 410,
      y: 210,
      width: 600,
      height: 540,
      fill: "grey",
      shadowBlur: 10,
      cornerRadius: 6,
    });

    const socDisplay = new Konva.Rect({
      x: 430,
      y: 230,
      width: 500,
      height: 500,
      fill: "black",
    });

    const scale50km = new Konva.Rect({
      x: 940,
      y: 230,
      width: 60,
      height: 60,
      stroke: "black",
    });
    const scale30km = new Konva.Rect({
      x: 940,
      y: 290,
      width: 60,
      height: 60,
      stroke: "black",
    });
    const scale15km = new Konva.Rect({
      x: 940,
      y: 350,
      width: 60,
      height: 60,
      stroke: "black",
    });

    const on = new Konva.Rect({
      x: 940,
      y: 440,
      width: 60,
      height: 60,
      stroke: "black",
    });

    const off = new Konva.Rect({
      x: 940,
      y: 500,
      width: 60,
      height: 60,
      stroke: "black",
    });

    const captureIndicator = new Konva.Circle({
      x: 970,
      y: 585,
      width: 30,
      height: 30,
      fill: "red",
    });

    const capture = new Konva.Rect({
      x: 940,
      y: 610,
      width: 60,
      height: 60,
      stroke: "black",
    });

    const resetCapture = new Konva.Rect({
      x: 940,
      y: 670,
      width: 60,
      height: 60,
      stroke: "black",
    });

    layer.add(socPanel);
    layer.add(socDisplay);
    layer.add(scale50km);
    layer.add(scale30km);
    layer.add(scale15km);
    layer.add(on);
    layer.add(off);
    layer.add(captureIndicator);
    layer.add(capture);
    layer.add(resetCapture);
    this.stage?.add(layer);
  }

  private drawWeaponPanel() {
    const layer = new Konva.Layer();

    const weaponPanel = new Konva.Rect({
      x: 1020,
      y: 410,
      width: 400,
      height: 400,
      fill: "grey",
      shadowBlur: 10,
      cornerRadius: 6,
    });

    layer.add(weaponPanel);
    this.stage?.add(layer);
  }
}
