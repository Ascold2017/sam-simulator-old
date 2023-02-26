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
      fill: supplyPanel.isEnabledPower ? null : 'black',
      fillPatternImage: image,
      fillPatternScale: { x: 0.234, y: 0.234 }
    }" />

    <vk-group v-if="supplyPanel.isEnabledPower">
      <vk-group v-for="(target, i) in canvasTargets" :config="{
        x: 645,
        y: (i) * 25 + 5,
      }" @click="targetRadar.captureTargetByDesignation(target.identifier!)">
        <vk-rect :config="{ x: 0, y: 0, width: 50, height: 20, fill: target.isDestroyed ? 'red' : 'white', cornerRadius: 3 }" />
        <vk-text :config="{
          x: 0,
          y: 0,
          height: 20,
          width: 50,
          text: `24${target.targetNumber}`,
          fontFamily: 'Russo One, sans-serif',
          fontSize: 12,
          verticalAlign: 'middle',
          align: 'center',
          fill: target.isDestroyed ? 'white' :'#181818',
          zIndex: 1
        }" />
      </vk-group>
      <vk-circle :config="{
        x: 350,
        y: 350,
        width: (2 * SAM_PARAMS.MISSILE_MAX_DISTANCE / SAM_PARAMS.BIP_SIDE) * 700,
        stroke: 'red',
        dash: [5, 5],
      }" />

      <vk-circle :config="{
        x: 350,
        y: 350,
        width: 20,
        stroke: 'red',
      }" />

      <vk-group v-for="destroyedTarget in destroyedTargets" :config="{ x: destroyedTarget.x, y: destroyedTarget.y }">
        <vk-line :config="{
          points: [-5, -5, 5, 5],
          stroke: destroyedTarget.isKilled ? 'white' : 'red',
          strokeWidth: 0.5
        }" />
        <vk-line :config="{
          points: [5, -5, -5, 5],
          stroke: destroyedTarget.isKilled ? 'white' : 'red',
          strokeWidth: 0.5
        }" />
      </vk-group>

      <vk-group v-for="(canvasTarget, i) in canvasTargets" :config="{ x: canvasTarget.x, y: canvasTarget.y }">
        <vk-circle :config="{ x: 0, y: 0, width: 2, fill: 'white' }" />
        <vk-text :config="{
          text: `24${canvasTarget.targetNumber}`,
          x: 0,
          y: -10,
          fontFamily: 'Russo One, sans-serif',
          fontSize: 11,
          fill: 'white'
        }" />

        <vk-text :config="{
          text: `${canvasTarget.height}`,
          x: 35,
          y: -10,
          fontFamily: 'Russo One, sans-serif',
          fontSize: 9,
          fill: 'white'
        }" />
        <vk-text :config="{
          text: `${canvasTarget.velocity}`,
          x: 35,
          y: 3,
          fontFamily: 'Russo One, sans-serif',
          fontSize: 9,
          fill: 'white'
        }" />
        <vk-line :config="{
          points: [
            0, 0,
            55, 0
          ],
          stroke: 'white',
          strokeWidth: 0.5
        }" />
        <vk-line :config="{
          points: [
            32, -10,
            32, 10
          ],
          stroke: 'white',
          strokeWidth: 0.5
        }" />
      </vk-group>

      <vk-line v-for="targetWayPoints in targetsWayPoints" :config="{
        points: targetWayPoints.reduce((acc, point) => [...acc, point.x, point.y], [] as number[]),
        stroke: 'white',
        strokeWidth: 0.5,
        dash: [3, 1, 3]
      }" />
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import SAM_PARAMS from '@/const/SAM_PARAMS';
import { useBipStore } from '@/store/bip';
import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import { computed, onMounted, ref } from 'vue';

const supplyPanel = useSupplyPanelStore()
const bipStore = useBipStore()
const targetRadar = useTargetRadarStore();
const image = ref();
onMounted(() => {
  const img = new Image(700, 700);
  img.src = SAM_PARAMS.IMAGE;
  img.onload = () => image.value = img;
})

const canvasTargets = computed(() => bipStore.flightObjects.map((fo, i) => {
  const startPoint = bipStore.wayPoints[fo.name][0];
  return {
    identifier: fo.identifier,
    x: (2 * startPoint.x / SAM_PARAMS.BIP_SIDE) * 350 + 350,
    y: (2 * startPoint.y / SAM_PARAMS.BIP_SIDE) * 350 + 350,
    targetNumber: new Array(2).join("0") + String(i).slice(-2),
    height: (new Array(3).join("0") +
      Number(fo.currentPoint.z * 10).toFixed(0)).slice(-3),
    velocity: fo.velocity,
    isKilled: fo.isKilled,
    isDestroyed: fo.isDestroyed
  }
}));

const targetsWayPoints = computed(() => Object.keys(bipStore.wayPoints).map(id => bipStore.wayPoints[id].map(wayPoint => ({
  x: (2 * wayPoint.x / SAM_PARAMS.BIP_SIDE) * 350 + 350,
  y: (2 * wayPoint.y / SAM_PARAMS.BIP_SIDE) * 350 + 350,
}))));

const destroyedTargets = computed(() => bipStore.flightObjects.filter(fo => fo.isDestroyed).map(fo => ({
  x: (2 * fo.currentPoint.x / SAM_PARAMS.BIP_SIDE) * 350 + 350,
  y: (2 * fo.currentPoint.y / SAM_PARAMS.BIP_SIDE) * 350 + 350,
  isKilled: fo.isKilled
})));
</script>