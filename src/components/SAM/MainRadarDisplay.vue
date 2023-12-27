<template>
  <vk-group :config="{
    x: 20,
    y: 20,
  }">
    <vk-rect :config="{
      name: 'display',
      x: -5,
      y: -5,
      width: 830,
      height: 630,
      fill: 'black',
    }" />

    <vk-group v-if="mainStore.isEnabled">
      <vk-circle :config="{ x: 310, y: 310, width: SAM_PARAMS.MAX_DISTANCE / (scale), fill: 'rgb(15, 33, 19)' }" />
      <!-- Distance circles -->
      <vk-circle :config="{ x: 310, y: 310, width: i * (scale / 4), stroke: 'rgb(150, 249, 123)', strokeWidth: 0.1 }"
        v-for="i in countCircles" />
      <!-- Killzone circle -->
      <vk-circle :config="{ x: 310, y: 310, width: 70000 / scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.5 }" />
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
        offsetY: 12.5,
        align: 'center',
        verticalAlign: 'middle',
        fontFamily: 'Russo One, sans-serif',
        fill: 'rgb(150, 249, 123)',
        fontSize: 11,
        width: 25,
        height: 12
      }" v-for="azimutLine in azimutLines" />

    </vk-group>
    <!-- targets -->
    <vk-group v-if="mainStore.isEnabled">
      <vk-group v-for="canvasObject in canvasObjects">
        <vk-arc :config="{
          x: 310, y: 310,
          innerRadius: canvasObject.radius,
          outerRadius: canvasObject.radius,
          angle: canvasObject.angle,
          rotation: canvasObject.rotation,
          strokeWidth: canvasObject.strokeWidth,
          stroke: `rgba(150, 249, 123, ${canvasObject.alpha})`
        }" />
        <vk-arc v-if="canvasObject.isEnemy" :config="{
          x:  canvasObject.x + 310,
          y:  canvasObject.y + 310,
          innerRadius: 10,
          outerRadius: 10,
          strokeWidth: 0.5,
          angle: 360,
          stroke: 'rgb(150, 249, 123)'
        }"/>
      </vk-group>
     
      <vk-group v-for="(targetObject, i) in targetObjects" :config="{ x: 620, y: 20 + i * 40 }">
      
        <vk-text :config="{
          x: 0, y: 0,
          text: targetObject.params,
          verticalAlign: 'middle',
          fontFamily: 'Russo One, sans-serif',
          fill: 'rgb(150, 249, 123)',
          fontSize: 9,
        }" />
      </vk-group>

    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import SAM_PARAMS from '@/const/SAM_PARAMS';
import { useMainStore } from '@/store/main';
import { inject } from 'vue';
import type Engine from '@/core/Engine/Engine';
import type { SAM } from '@/core/SAM/SAM';
import type BaseRadarObject from '@/core/SAM/RadarObject/BaseRadarObject';
import DetectedRadarObject from '@/core/SAM/RadarObject/DetectedRadarObject';

interface ICanvasObject {
  x: number;
  y: number;
  radius: number;
  strokeWidth: number;
  angle: number;
  rotation: number;
  alpha: number;
  isDetected: boolean;
  isEnemy: boolean;
};

interface ITargetObject { params: string };

const engine = inject<Engine>("engine");
const sam = inject<SAM>("sam");
const mainStore = useMainStore();

const scale = 200;
const countCircles = computed(() => SAM_PARAMS.MAX_DISTANCE / 10000);
const azimutLines = computed(() => {
  return Array(36).fill(0).map((_, i) => {
    const cos = Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2);
    const sin = Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2);
    return {
      x0: cos * (5000 / scale) + 310,
      y0: sin * (5000 / scale) + 310,
      x1: cos * (SAM_PARAMS.MAX_DISTANCE / (scale * 2)) + 310,
      y1: sin * (SAM_PARAMS.MAX_DISTANCE / (scale * 2)) + 310,
      angleLabel: String(i * 10),

    }
  });
});


const canvasObjects = ref<ICanvasObject[]>([]);
const targetObjects = ref<ITargetObject[]>([]);
  const convertFlightObjectToCanvasObject = (target: BaseRadarObject) => {
    const canvasTargetArcAngle = (target.size * 1000 * 180) / (target.distance * Math.PI) + SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY * 2;
    const targetSpotDistance = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / (scale * 2);
    return {
      x:  target.x / (scale * 2),
      y:  target.y / (scale * 2),
      radius: target.distance / (scale * 2),
      rotation: target.azimuth * (180 / Math.PI) - canvasTargetArcAngle / 2,
      angle: canvasTargetArcAngle,
      strokeWidth: targetSpotDistance,
      alpha: target.visibilityK * 1,
      isDetected: target instanceof DetectedRadarObject,
      isEnemy: target instanceof DetectedRadarObject && !target.isMissile
    }
  };
const refreshTargets = () => {
  
  if (mainStore.isEnabled) {
    canvasObjects.value = sam!.getRadarObjects().map(convertFlightObjectToCanvasObject);
    targetObjects.value = sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject).map(fo => ({
      params: `|${fo.id}|\n|Azimuth: ${(fo.azimuth* (180 / Math.PI)).toFixed(1)}* |Elevation: ${(fo.elevation * (180 / Math.PI)).toFixed(1)}* |\n|D: ${(fo.distance / 1000).toFixed(1)}km |H: ${fo.height.toFixed(0)}m |V: ${fo.velocity}m/s |P: ${(fo.param / 1000).toFixed(1)}km`
    }))
  } else {
    canvasObjects.value = [];
    targetObjects.value = [];
  }
}

onMounted(() => {
  engine?.addFPSLoop("mainRadarLoop", () => {
    refreshTargets();
  })
})

</script>@/core/SAM/RadarObject/DetectedFlightObject