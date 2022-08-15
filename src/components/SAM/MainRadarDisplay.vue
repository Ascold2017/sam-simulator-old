<template>
  <v-group :config="{
    x: 20,
    y: 180,
  }">
    <v-rect :config="{
      name: 'display',
      x: 0,
      y: 0,
      width: 700,
      height: 700,
      fill: 'black',
    }" />

    <v-group v-if="supplyPanel.isEnabledPower">
      <v-text :config="{
        x: 10,
        y: 10,
        text: `Азимут: ${azimutLabel}°`,
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12,
        fill: 'rgb(150, 249, 123)',
      }" />
      <v-text :config="{
        x: 10,
        y: 680,
        text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12,
        fill: 'rgb(150, 249, 123)',
      }" />
      <v-circle
        :config="{ x: 350, y: 350, width: mainRadar.maxDisplayedDistance * mainRadar.scale * 2, fill: 'rgb(15, 33, 19)' }" />
      <!-- Distance circles -->
      <v-circle
        :config="{ x: 350, y: 350, width: i * 20 * mainRadar.scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.1 }"
        v-for="i in countCircles" />
      <!-- Killzone circle -->
      <v-circle v-if="mainRadar.maxDisplayedDistance > 50"
        :config="{ x: 350, y: 350, width: 100 * mainRadar.scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.5 }" />
      <!-- Azimut lines -->
      <v-line :config="{
        points: [azimutLine.x0, azimutLine.y0, azimutLine.x1, azimutLine.y1,],
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.1
      }" v-for="azimutLine in azimutLines" />
      <!-- Azimut labels -->
      <v-text :config="{
        x: azimutLine.x1,
        y: azimutLine.y1,
        text: azimutLine.angleLabel,
        rotation: azimutLine.angleLabel,
        offsetX: 12.5,
        offsetY: 6,
        align: 'center',
        verticalAlign: 'middle',
        fontFamily: 'Russo One, sans-serif',
        fill: 'rgb(150, 249, 123)',
        fontSize: 11,
        width: 25,
        height: 12
      }" v-for="azimutLine in azimutLines" />

      <!-- Rotation cursor -->
      <v-line :config="{
        points: [radarCursorLine.x0, radarCursorLine.y0, radarCursorLine.x1, radarCursorLine.y1],
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 1
      }" />
      <!-- Target cursor line -->
      <v-arrow v-if="!targetRadarStore.isCapturedAll" :config="{
        points: [targetCursorLine.x0, targetCursorLine.y0, targetCursorLine.x1, targetCursorLine.y1],
        stroke: 'white',
        fill: 'white',
        pointerLength: 5,
        pointerWidth: 5,
        strokeWidth: 0.5
      }" />
    </v-group>
    <!-- targets -->
    <v-group v-if="supplyPanel.isEnabledPower && supplyPanel.isEnabledMainRadar && !mainRadar.isEquivalent">
      <v-arc v-for="canvasTarget in canvasTargets" :config="{
        x: 350, y: 350,
        innerRadius: canvasTarget.radius,
        outerRadius: canvasTarget.radius,
        angle: canvasTarget.angle,
        rotation: canvasTarget.rotation,
        strokeWidth: canvasTarget.strokeWidth,
        stroke: `rgba(150, 249, 123, ${canvasTarget.alpha})`
      }" />
      <v-circle v-if="targetRadarStore.isCapturedAll && targetRadarStore.capturedTarget" :config="{
        x: targetRadarStore.capturedTarget.x * mainRadar.scale + 350,
        y: targetRadarStore.capturedTarget.y * mainRadar.scale + 350,
        width: 20,
        height: 20,
        stroke: `rgb(150, 249, 123)`,
        strokeWidth: 0.5
      }" />
      <v-circle v-if="targetRadarStore.isCapturedAll" :config="{
        x: canvasHitPoint.x,
        y: canvasHitPoint.y,
        width: 4,
        height: 4,
        fill: 'white'
      }" />
      <v-circle v-for="canvasMissile in canvasMissiles" :config="{
        x: canvasMissile.x,
        y: canvasMissile.y,
        width: 4,
        height: 4,
        fill: 'red'
      }" />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">

import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useMainRadarStore } from '@/store/mainRadarPanel';
import { useTargetsStore } from '@/store/targets';
import { useTargetRadarStore } from '@/store/targetRadar';
import { computed } from 'vue';
import { SAM_PARAMS } from '@/classes/SAM';

interface ICanvasTarget {
  radius: number;
  strokeWidth: number;
  angle: number;
  rotation: number;
  alpha: number
};

const supplyPanel = useSupplyPanelStore()
const mainRadar = useMainRadarStore()
const targetsStore = useTargetsStore()
const targetRadarStore = useTargetRadarStore()

const azimutLabel = computed(() => {
  const deg = (targetRadarStore.targetCursorAngle - 1.5 * Math.PI) * (180 / Math.PI)
  return (deg < 0 ? 360 + deg : deg).toFixed(1);
});
const countCircles = computed(() => mainRadar.maxDisplayedDistance / 10);
const azimutLines = computed(() => {
  return Array(36).fill(0).map((_, i) => ({
    x0: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 350,
    y0: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 350,
    x1: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (mainRadar.maxDisplayedDistance * mainRadar.scale + 10) + 350,
    y1: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (mainRadar.maxDisplayedDistance * mainRadar.scale + 10) + 350,
    angleLabel: String(i * 10)
  }))
});

const targetCursorLine = computed(() => {
  const azimut = targetRadarStore.targetCursorAngle;
  const distance = targetRadarStore.targetCursorDistance > mainRadar.maxDisplayedDistance
    ? mainRadar.maxDisplayedDistance
    : targetRadarStore.targetCursorDistance;
  return {
    x0: 350,
    y0: 350,
    x1: Math.cos(azimut) * (distance * mainRadar.scale) + 350,
    y1: Math.sin(azimut) * (distance * mainRadar.scale) + 350
  }
});

const radarCursorLine = computed(() => ({
  x0: 350,
  y0: 350,
  x1: Math.cos(mainRadar.radarRotation) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 350,
  y1: Math.sin(mainRadar.radarRotation) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 350,
}));
const canvasTargets = computed<ICanvasTarget[]>(() => {

  return targetsStore.targets
    .filter(t => t.distance < mainRadar.maxDisplayedDistance)
    .map(target => {
      const canvasTargetArcAngle = (target.size * mainRadar.gain * 180) / (target.distance * Math.PI) + SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY * 2;
      const targetSpotDistance = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY * mainRadar.scale;

      return {
        radius: target.distance * mainRadar.scale,
        rotation: target.azimut * (180 / Math.PI) - canvasTargetArcAngle / 2,
        angle: canvasTargetArcAngle,
        strokeWidth: targetSpotDistance,
        alpha: target.visibilityK * mainRadar.brightness
      }
    });
});

const canvasMissiles = computed(() => {
  return targetsStore.missiles.map(missile => ({
    x: missile.x * mainRadar.scale + 350,
    y: missile.y * mainRadar.scale + 350
  }));
})

const canvasHitPoint = computed(() => {
  if (!targetRadarStore.capturedTarget) return { x: 0, y: 0 }
  const hitX = targetRadarStore.distanceToHit *
    Math.cos(targetRadarStore.capturedTarget.azimut) * mainRadar.scale + 350;
  const hitY = targetRadarStore.distanceToHit *
    Math.sin(targetRadarStore.capturedTarget.azimut) * mainRadar.scale + 350;
  return {
    x: hitX,
    y: hitY
  }
})

</script>