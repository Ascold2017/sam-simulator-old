<template>
  <v-group :config="props.config">
    <v-rect :config="{
      x: 0,
      y: 0,
      height: 140,
      width: 160,
      fill: 'white',
      stroke: '#181818',
      cornerRadius: 2
    }" />

    <v-shape :config="{
      x: 0,
      y: 0,
      height: 140,
      width: 160,
      stroke: '#181818',
      sceneFunc: drawStrokes
    }" />
  </v-group>
</template>

<script setup lang="ts">
import type Konva from 'konva';

const props = defineProps<{
  config: Record<string, any>,
  label: string;
  value: number,
  strokes: number;
  minValue: number;
  maxValue: number;
}>();
const drawStrokes = (ctx: CanvasRenderingContext2D, shape: Konva.Shape) => {

  const basisX = shape.width() / 2;
  const basisY = shape.height() - 30;

  ctx!.font = "14px Russo One, sans-serif";
  ctx!.fillStyle = "#181818";
  ctx.textAlign = 'center';
  ctx.fillText(props.label, basisX, basisY);
  for (let i = 0; i <= props.strokes; i++) {
    const angle = -135 * (Math.PI / 180) + i * ((Math.PI / 2) / props.strokes)
    const isEvery10 = i % 10 === 0;
    const isEvery5 = i % 5 === 0;
    const innerX = basisX +
      (basisY - (isEvery5 ? 35 : 30)) *
      Math.cos(angle);
    const innerY = basisY +
      (basisY - (isEvery5 ? 35 : 30)) *
      Math.sin(angle);
    const outerX = basisX +
      (basisY - 25) *
      Math.cos(angle);
    const outerY = basisY +
      (basisY - 25) *
      Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();

    if (isEvery10) {
      const labelValue = ((props.maxValue - props.minValue) / props.strokes) * i;
      ctx!.font = "9px Russo One, sans-serif";
      ctx!.fillStyle = "#181818";
      ctx!.save();
      ctx!.translate(outerX, outerY);
      ctx!.rotate(angle + Math.PI / 2);
      ctx!.textAlign = "center";
      ctx!.fillText(labelValue.toString(), 0, -5);
      ctx!.restore();
    }
  }

  const valueK = (props.value > props.maxValue) ? 1 : (props.value / (props.maxValue - props.minValue));
  const innerX = basisX + (basisY - 90) * Math.cos((Math.PI / 2) * valueK + (-135 * (Math.PI / 180)));
  const innerY = basisY + (basisY - 90) * Math.sin((Math.PI / 2) * valueK + (-135 * (Math.PI / 180)));
  const indicatorX = basisX + (basisY - 30) * Math.cos((Math.PI / 2) * valueK + (-135 * (Math.PI / 180)));
  const indicatorY = basisY + (basisY - 30) * Math.sin((Math.PI / 2) * valueK + (-135 * (Math.PI / 180)));
  ctx.strokeStyle = 'red';
  ctx.moveTo(innerX, innerY);
  ctx.lineTo(indicatorX, indicatorY);
  ctx.stroke();
}
</script>