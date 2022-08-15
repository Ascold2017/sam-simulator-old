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

    <v-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 10,
      text: `Азимут: ${azimutLabel}°`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />
    <v-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 30,
      text: `Угол места: ${elevationLabel}°`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />
    <v-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 680,
      text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />


    <v-group v-if="supplyPanel.isEnabledPower" :config="{
      x: 350, y: 350,
      rotation: targetRadarStore.targetCursorAngle * (180 / Math.PI)
    }">
      <v-rect :config="{
        width: 330,
        height: 150,
        fill: 'rgb(15, 33, 19)',
        strokeWidth: 0.5,
        offsetY: 75,
      }" />
      <!-- Center line -->
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        offsetY: 75,
        points: [0, 75, 330, 75]
      }" />
      <!-- Distance lines -->
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [lineY, 0, lineY, 150],
        dash: [2, 10],
        offsetY: 75
      }" v-for="lineY in canvasDistanceLinesY" />
      <!-- Distance window lines -->
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [canvasDistanceWindow.start, 0, canvasDistanceWindow.start, 150],
        offsetY: 75
      }" />
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [canvasDistanceWindow.end, 0, canvasDistanceWindow.end, 150],
        offsetY: 75
      }" />
      <v-group v-if="!targetRadarStore.isEquivalent">
        <!-- Targets -->
        <v-rect v-for="canvasTarget in canvasTargets" :config="{
          x: canvasTarget.x,
          y: canvasTarget.y,
          stroke: `rgba(150, 249, 123, ${canvasTarget.alpha})`,
          fill: `rgba(150, 249, 123, ${canvasTarget.alpha})`,
          height: canvasTarget.width,
          width: canvasTarget.length,
          offsetX: canvasTarget.length / 2,
          offsetY: canvasTarget.width / 2,
        }" />
      </v-group>

    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { SAM_PARAMS } from '@/classes/SAM';
import { useMainRadarStore } from '@/store/mainRadarPanel';
import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useTargetRadarStore } from '@/store/targetRadar';
import { useTargetsStore } from '@/store/targets';
import { computed } from 'vue';

const supplyPanel = useSupplyPanelStore()
const mainRadar = useMainRadarStore()
const targetsStore = useTargetsStore()
const targetRadarStore = useTargetRadarStore()

const azimutLabel = computed(() => {
  const deg = (targetRadarStore.targetCursorAngle - 1.5 * Math.PI) * (180 / Math.PI)
  return (deg < 0 ? 360 + deg : deg).toFixed(1);
});

const elevationLabel = computed(() => {
  return (targetRadarStore.targetCursorElevation * (180 / Math.PI)).toFixed(1);
});


interface ICanvasTarget {
  x: number;
  y: number;
  width: number;
  length: number;
  alpha: number
};


const canvasTargets = computed<ICanvasTarget[]>(() => {
  if (!supplyPanel.isEnabledTargetRadarTransmitter) return []
  return targetsStore.targetsInRay
    .map(target => {
      const offsetDistanceK = target.distance / SAM_PARAMS.MAX_DISTANCE;
      const offsetDistanceCanvas = offsetDistanceK * 330;
      const distanceDetectAccuracyCanvas = (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.MAX_DISTANCE) * 330

      const offsetElevation = targetRadarStore.isCapturedDirection
        ? 0
        : (target.elevation - targetRadarStore.targetCursorElevation);

      const offsetElevationK = 2 * offsetElevation / SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT;
      const canvasOffsetElevation = offsetElevationK * 75;  // Half of rect width

      const rayWidth = ((Math.PI * SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT * target.distance) / 180);
      const azimutOffsetK = 1 - 2 * Math.abs(targetRadarStore.targetCursorAngle - target.azimut) / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH;
      const alpha = target.visibilityK * azimutOffsetK * (1 - Math.abs(offsetElevationK)) * targetRadarStore.brightness
      return {
        x: offsetDistanceCanvas,
        y: canvasOffsetElevation,
        length: distanceDetectAccuracyCanvas,
        width: target.size * targetRadarStore.gain / rayWidth,
        alpha
      }
    });
});

const canvasDistanceWindow = computed(() => {
  return {
    start: ((targetRadarStore.targetCursorDistance - SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2) / SAM_PARAMS.MAX_DISTANCE) * 330,
    end: ((targetRadarStore.targetCursorDistance + SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2) / SAM_PARAMS.MAX_DISTANCE) * 330,
  }
});

const canvasDistanceLinesY = computed(() => Array(SAM_PARAMS.MAX_DISTANCE / 10).fill(0).map((_, i) => (i * 10 / SAM_PARAMS.MAX_DISTANCE) * 330))
</script>