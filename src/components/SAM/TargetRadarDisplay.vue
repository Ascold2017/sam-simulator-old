<template>
  <vk-group :config="{
    x: 20,
    y: 180,
  }">
    <vk-rect :config="{
      name: 'display',
      x: 0,
      y: 0,
      width: 700,
      height: 700,
      fill: 'black',
    }" />

    <vk-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 10,
      text: `Азимут: ${azimutLabel}°`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />
    <vk-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 30,
      text: `Угол места: ${elevationLabel}°`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />
    <vk-text v-if="supplyPanel.isEnabledPower" :config="{
      x: 10,
      y: 680,
      text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: 'rgb(150, 249, 123)',
    }" />

    <vk-group v-if="supplyPanel.isEnabledPower && !targetRadarStore.isCapturedAll" :config="{
      x: 350, y: 350,
      rotation: targetRadarStore.targetCursorAngle * (180 / Math.PI)
    }">
      <vk-rect :config="{
        width: canvasWidth,
        height: canvasHeight,
        fill: 'rgb(15, 33, 19)',
        strokeWidth: 0.5,
        offsetY: canvasHeight/2,
      }" />
      <!-- Center line -->
      <vk-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        offsetY: canvasHeight/2,
        points: [0, canvasHeight/2, canvasWidth, canvasHeight/2]
      }" />
      <!-- Distance lines -->
      <vk-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [lineY, 0, lineY, canvasHeight],
        dash: [2, 10],
        offsetY: canvasHeight/2
      }" v-for="lineY in canvasDistanceLinesY" />
      <!-- Distance window lines -->
      <vk-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [canvasDistanceWindow.start, 0, canvasDistanceWindow.start, canvasHeight],
        offsetY: canvasHeight/2
      }" />
      <vk-line :config="{
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        points: [canvasDistanceWindow.end, 0, canvasDistanceWindow.end, canvasHeight],
        offsetY: canvasHeight/2
      }" />
      <vk-group>
        <!-- Targets -->
        <vk-rect v-for="canvasTarget in canvasTargets" :config="{
          x: canvasTarget.x,
          y: canvasTarget.y,
          stroke: `rgba(150, 249, 123, ${canvasTarget.alpha})`,
          fill: `rgba(150, 249, 123, ${canvasTarget.alpha})`,
          height: canvasTarget.width,
          width: canvasTarget.length,
          offsetX: canvasTarget.length / 2,
          offsetY: canvasTarget.width / 2,
        }" />
      </vk-group>

    </vk-group>

    <vk-group v-else-if="targetRadarStore.isCapturedAll" :config="{
      x: 0, y: 0,
    }">
      <vk-circle :config="{ x: 350, y: 350, width: (SAM_PARAMS.MIN_CAPTURE_RANGE/SAM_PARAMS.MAX_DISTANCE) * 700, stroke: 'white', strokeWidth: 0.5,}" />
      <vk-circle :config="{ x: 350, y: 350, width: (50/SAM_PARAMS.MAX_DISTANCE) * 700, stroke: 'red', strokeWidth: 0.5, dash: [5, 5]}" />
      <vk-circle :config="{ x: canvasCapturedTarget.x, y: canvasCapturedTarget.y, width: 5, fill: 'rgb(150, 249, 123)', }" />
      <vk-circle :config="{ x: canvasCapturedTarget.hitX, y: canvasCapturedTarget.hitY,width: 5, fill: 'white', }" />
      <vk-circle v-for="canvasMissile in canvasMissiles" :config="{ x: canvasMissile.x, y: canvasMissile.y, width: 5, fill: 'red', }" />
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import SAM_PARAMS from '@/const/SAM_PARAMS';
import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useTargetRadarStore } from '@/store/targetRadar';
import { useTargetsStore } from '@/store/targets';
import { computed } from 'vue';

const supplyPanel = useSupplyPanelStore()
const targetsStore = useTargetsStore()
const targetRadarStore = useTargetRadarStore()

const canvasHeight = 150;
const canvasWidth = 330

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
      const offsetDistanceCanvas = offsetDistanceK * canvasWidth;
      const distanceDetectAccuracyCanvas = (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.MAX_DISTANCE) * canvasWidth

      const offsetElevation = targetRadarStore.isCapturedDirection
        ? 0
        : (target.elevation - targetRadarStore.targetCursorElevation);

      const offsetElevationK = 2 * offsetElevation / SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT;
      const canvasOffsetElevation = offsetElevationK * canvasHeight/2;  // Half of rect width

      const rayWidth = ((Math.PI * SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT * target.distance) / 180);
      const azimutOffsetK = 1 - 2 * Math.abs(targetRadarStore.targetCursorAngle - target.azimuth) / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH;
      const alpha = target.visibilityK * azimutOffsetK * (1 - Math.abs(offsetElevationK)) * targetRadarStore.brightness
      return {
        x: offsetDistanceCanvas,
        y: canvasOffsetElevation,
        length: distanceDetectAccuracyCanvas,
        width: (target.size * targetRadarStore.gain) / rayWidth,
        alpha
      }
    });
});

const canvasDistanceWindow = computed(() => {
  return {
    start: ((targetRadarStore.targetCursorDistance - SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2) / SAM_PARAMS.MAX_DISTANCE) * canvasWidth,
    end: ((targetRadarStore.targetCursorDistance + SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2) / SAM_PARAMS.MAX_DISTANCE) * canvasWidth,
  }
});

const canvasDistanceLinesY = computed(() => Array(SAM_PARAMS.MAX_DISTANCE / 10).fill(0).map((_, i) => (i * 10 / SAM_PARAMS.MAX_DISTANCE) * canvasWidth))

const canvasCapturedTarget = computed(() => {
  if (!targetRadarStore.isCapturedAll || !targetRadarStore.capturedTarget) return { x: 0, y: 0 }
  return {
    x: (targetRadarStore.capturedTarget.x/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
    y: (targetRadarStore.capturedTarget.y/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
    hitX: (targetRadarStore.pointToHit.x/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
    hitY: (targetRadarStore.pointToHit.y/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
  }
})

const canvasMissiles = computed<{ x: number, y: number }[]>(() => {
  if (!supplyPanel.isEnabledTargetRadarTransmitter) return []
  return targetsStore.missiles
    .map(missile => {
      return {
        x: (missile.x/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
        y: (missile.y/SAM_PARAMS.MAX_DISTANCE) * 350 + 350,
      }
    });
});
</script>