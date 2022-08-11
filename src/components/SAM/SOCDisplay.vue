<template>
  <v-group :config="{ x: 20, y: 20 }">
    <v-rect :config="{
      name: 'display',
      x: 0,
      y: 0,
      width: 510,
      height: 500,
      fill: supplyPanel.isEnabledPower ? 'rgb(15, 33, 19)' : 'black',
    }" />

    <v-group v-if="supplyPanel.isEnabledPower">

      <v-circle
        :config="{ x: 255, y: 250, width: i * 20 * mainRadar.scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.1 }"
        v-for="i in countCircles" />

      <v-line :config="{
        points: [azimutLine.x0, azimutLine.y0, azimutLine.x1, azimutLine.y1,],
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.1
      }" v-for="azimutLine in azimutLines" />
      <v-text :config="{
        x: azimutLine.x1 - 10,
        y: azimutLine.y1 - 6,
        text: azimutLine.angleLabel,
        align: 'center',
        verticalAlign: 'middle',
        fontFamily: 'Russo One, sans-serif',
        fill: 'rgb(150, 249, 123)',
        fontSize: 9,
        width: 20,
        height: 12
      }" v-for="azimutLine in azimutLines" />
      <v-line :config="{
        points: [targetCursorLine.x0, targetCursorLine.y0, targetCursorLine.x1, targetCursorLine.y1],
        dash: targetCursorLine.dash,
        stroke: 'white',
        strokeWidth: 0.5
      }" />
      <v-line :config="{
        points: [radarCursorLine.x0, radarCursorLine.y0, radarCursorLine.x1, radarCursorLine.y1],
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 1
      }" />
    </v-group>
    <!-- targets -->
    <v-group
      v-if="supplyPanel.isEnabledPower && supplyPanel.isEnabledRotation && supplyPanel.isEnabledMainRadarTransmitter">
      <v-arc v-for="canvasTarget in canvasTargets" :config="{
        x: 255, y: 250,
        innerRadius: canvasTarget.radius,
        outerRadius: canvasTarget.radius,
        angle: canvasTarget.angle,
        rotation: canvasTarget.rotation,
        strokeWidth: canvasTarget.strokeWidth,
        stroke: `rgba(150, 249, 123, ${canvasTarget.alpha})`
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

const countCircles = computed(() => mainRadar.maxDisplayedDistance / 10);
const azimutLines = computed(() => {
  return Array(36).fill(0).map((_, i) => ({
    x0: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 255,
    y0: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 250,
    x1: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (mainRadar.maxDisplayedDistance * mainRadar.scale + 10) + 255,
    y1: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (mainRadar.maxDisplayedDistance * mainRadar.scale + 10) + 250,
    angleLabel: String(i * 10)
  }))
});

const targetCursorLine = computed(() => {
  const azimut = targetRadarStore.isCapturedAzimut && targetRadarStore.capturedTarget
    ? targetRadarStore.capturedTarget.azimut
    : mainRadar.targetCursorAngle;
  const distanceToWindow = mainRadar.targetCursorDistance * mainRadar.scale - SAM_PARAMS.RADAR_DISTANCE_WINDOW * mainRadar.scale/2;
  const distanceFromWindow = (mainRadar.maxDisplayedDistance - mainRadar.targetCursorDistance - SAM_PARAMS.RADAR_DISTANCE_WINDOW/2) * mainRadar.scale
  return {
    x0: 255,
    y0: 250,
    x1: Math.cos(azimut) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 255,
    y1: Math.sin(azimut) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 250,
    dash: [
      distanceToWindow,
      SAM_PARAMS.RADAR_DISTANCE_WINDOW * mainRadar.scale,
      distanceFromWindow
    ]
  }
});

const radarCursorLine = computed(() => ({
  x0: 255,
  y0: 250,
  x1: Math.cos(mainRadar.radarRotation) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 255,
  y1: Math.sin(mainRadar.radarRotation) * (mainRadar.maxDisplayedDistance * mainRadar.scale) + 250,
}));
const canvasTargets = computed<ICanvasTarget[]>(() => {
  return targetsStore.targets
    .filter(t => t.distance < mainRadar.maxDisplayedDistance)
    .map(target => {
      const canvasTargetArcAngle = (target.size * SAM_PARAMS.RADAR_SPOT_AZIMUT_GAIN * 180) / (target.distance * Math.PI)  + SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY * 2;
      const targetSpotDistance = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY * mainRadar.scale
      const alpha = 1
      return {
        radius: target.distance * mainRadar.scale,
        rotation: target.azimut * (180 / Math.PI) - canvasTargetArcAngle / 2,
        angle: canvasTargetArcAngle,
        strokeWidth: targetSpotDistance,
        alpha
      }
    });
});

</script>