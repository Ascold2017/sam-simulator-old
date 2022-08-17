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

    <vk-group v-if="supplyPanel.isEnabledPower">
      <vk-text :config="{
        x: 10,
        y: 10,
        text: `Азимут: ${azimutLabel}°`,
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12,
        fill: 'rgb(150, 249, 123)',
      }" />
      <vk-text :config="{
        x: 10,
        y: 680,
        text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12,
        fill: 'rgb(150, 249, 123)',
      }" />
      <vk-circle
        :config="{ x: 350, y: 350, width: SAM_PARAMS.MAX_DISTANCE * mainRadar.scale * 2, fill: 'rgb(15, 33, 19)' }" />
      <!-- Distance circles -->
      <vk-circle
        :config="{ x: 350, y: 350, width: i * 20 * mainRadar.scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.1 }"
        v-for="i in countCircles" />
      <!-- Killzone circle -->
      <vk-circle
        :config="{ x: 350, y: 350, width: 100 * mainRadar.scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.5 }" />
      <!-- Azimut lines -->
      <vk-line :config="{
        points: [azimutLine.x0, azimutLine.y0, azimutLine.x1, azimutLine.y1,],
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.1
      }" v-for="azimutLine in azimutLines" />
      <!-- Azimut labels -->
      <vk-text :config="{
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

      <!-- Target cursor line -->
      <vk-line v-if="!targetRadarStore.isCapturedAll" :config="{
        points: [targetCursorLine.x0, targetCursorLine.y0, targetCursorLine.x1, targetCursorLine.y1],
        stroke: 'white',
        fill: 'white',
        strokeWidth: 1
      }" />
    </vk-group>
    <!-- targets -->
    <vk-group v-if="supplyPanel.isEnabledPower && supplyPanel.isEnabledMainRadar">
      <vk-arc v-for="canvasTarget in canvasTargets" :config="{
        x: 350, y: 350,
        innerRadius: canvasTarget.radius,
        outerRadius: canvasTarget.radius,
        angle: canvasTarget.angle,
        rotation: canvasTarget.rotation,
        strokeWidth: canvasTarget.strokeWidth,
        stroke: `rgba(150, 249, 123, ${canvasTarget.alpha})`
      }" />
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">

import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useMainRadarStore } from '@/store/mainRadarPanel';
import { useTargetsStore } from '@/store/targets';
import { useTargetRadarStore } from '@/store/targetRadar';
import { computed, onMounted, onUnmounted, ref } from 'vue';
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
const countCircles = computed(() => SAM_PARAMS.MAX_DISTANCE / 10);
const azimutLines = computed(() => {
  return Array(36).fill(0).map((_, i) => ({
    x0: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 350,
    y0: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (5 * mainRadar.scale) + 350,
    x1: Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2) * (SAM_PARAMS.MAX_DISTANCE * mainRadar.scale + 10) + 350,
    y1: Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2) * (SAM_PARAMS.MAX_DISTANCE * mainRadar.scale + 10) + 350,
    angleLabel: String(i * 10)
  }))
});

const targetCursorLine = computed(() => {
  const azimut = targetRadarStore.targetCursorAngle;
  const distance = targetRadarStore.targetCursorDistance;
  return {
    x0: 350,
    y0: 350,
    x1: Math.cos(azimut) * (distance * mainRadar.scale) + 350,
    y1: Math.sin(azimut) * (distance * mainRadar.scale) + 350
  }
});

const canvasTargets = ref<ICanvasTarget[]>([]);
const refreshTargets = () => {
  if (supplyPanel.isEnabledMainRadar) {
    canvasTargets.value = targetsStore.targets
      .filter(target => target.distance <= SAM_PARAMS.MAX_DISTANCE)
      .map(target => {
        const canvasTargetArcAngle = (target.size * targetRadarStore.gain * 180) / (target.distance * Math.PI) + SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY * 2;
        const targetSpotDistance = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY * mainRadar.scale;

        return {
          radius: target.distance * mainRadar.scale,
          rotation: target.azimut * (180 / Math.PI) - canvasTargetArcAngle / 2,
          angle: canvasTargetArcAngle,
          strokeWidth: targetSpotDistance,
          alpha: target.visibilityK * targetRadarStore.brightness
        }
      });
  } else {
    canvasTargets.value = []
  }
}

const interval = ref<number | null>(null)

onMounted(() => {
  refreshTargets()
  interval.value = setInterval(() => {
    refreshTargets()
  }, SAM_PARAMS.RADAR_UPDATE_INTERVAL)
})

onUnmounted(() => {
  interval.value && clearInterval(interval.value)
})
</script>