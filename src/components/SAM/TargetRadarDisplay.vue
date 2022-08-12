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
      fill: supplyPanel.isEnabledPower ? 'rgb(15, 33, 19)' : 'black',
    }" />

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
      y: 30,
      text: `Угол места: ${elevationLabel}°`,
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

    <v-group v-if="supplyPanel.isEnabledPower" :config="{
      x: 350, y: 350,
      rotation: targetRadarStore.targetCursorAngle * (180 / Math.PI)
    }">
      <v-rect :config="{
        width: 330,
        height: 150,
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        offsetY: 75,
      }" />
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.2,
        offsetY: 75,
        points: [165 - distanceDetectAccuracyCanvas, 0, 165 - distanceDetectAccuracyCanvas, 150]
      }" />
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.2,
        offsetY: 75,
        points: [165 + distanceDetectAccuracyCanvas, 0, 165 + distanceDetectAccuracyCanvas, 150]
      }" />
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.2,
        offsetY: 75,
        points: [0, 75 - elevationDetectAccuracyCanvas, 330, 75 - elevationDetectAccuracyCanvas]
      }" />
      <v-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.2,
        offsetY: 75,
        points: [0, 75 + elevationDetectAccuracyCanvas, 330, 75 + elevationDetectAccuracyCanvas]
      }" />
      <v-rect v-for="canvasTarget in canvasTargets" :config="{
        x: canvasTarget.x,
        y: canvasTarget.y,
        stroke: 'rgb(150, 249, 123)',
        fill: 'rgb(150, 249, 123)',
        height: canvasTarget.width,
        width: canvasTarget.length,
        offsetX: canvasTarget.length / 2,
        offsetY: canvasTarget.width / 2,
      }" />

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

const distanceDetectAccuracyCanvas = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.RADAR_DISTANCE_WINDOW * 230
const elevationDetectAccuracyCanvas = SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH * 100
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
    .filter(t => t.distance < mainRadar.maxDisplayedDistance)
    .map(target => {
      const offsetDistance = targetRadarStore.isCapturedDistance
        ? 0
        : (target.distance - targetRadarStore.targetCursorDistance);
      const offsetDistanceK = 2 * offsetDistance / SAM_PARAMS.RADAR_DISTANCE_WINDOW;
      const offsetDistanceCanvas = offsetDistanceK * 165 + 165; // Half of rect height
      const offsetElevation = targetRadarStore.isCapturedElevation
        ? 0
        : (target.elevation - targetRadarStore.targetCursorElevation);
      const offsetElevationK = 2 * offsetElevation / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH;
      const canvasOffsetElevation = offsetElevationK * 75;  // Half of rect width

      const rayWidth = ((Math.PI * SAM_PARAMS.TARGET_RADAR_RAY_WIDTH * target.distance) / 180);
      const alpha = 1
      return {
        x: offsetDistanceCanvas,
        y: canvasOffsetElevation,
        length: distanceDetectAccuracyCanvas,
        width: target.size / rayWidth,
        alpha
      }
    });
});
</script>