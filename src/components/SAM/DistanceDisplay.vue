<template>
  <v-group :config="{ x: 20, y: 20 }">

    <v-rect :config="{
      name: 'display',
      x: 0,
      y: 0,
      width: 360,
      height: 180,
      fill: supplyPanel.isEnabledPower ? 'rgb(15, 33, 19)' : 'black',
    }" />

    <v-line :config="{ points: [160, 10, 160, 170], stroke: 'white' }" />
    <v-line :config="{ points: [200, 10, 200, 170], stroke: 'white' }" />

    <SAMPotentiometer :x="0" :y="195" />

    <v-line v-if="supplyPanel.isEnabledTargetRadarTransmitter && targetRadar.capturedTargetId" :config="{
      points: targetLinePoints,
      stroke: 'rgb(150, 249, 123)',
      strokeWidth: 1,
    }" />
  </v-group>
</template>

<script setup lang="ts">
import { SAM_PARAMS } from "@/classes/SAM";
import { useMainRadarStore } from "@/store/mainRadarPanel";
import { useSupplyPanelStore } from "@/store/supplyPanel";
import { useTargetRadarStore } from "@/store/targetRadar";
import { computed } from "vue";
import SAMPotentiometer from "./SAMPotentiometer.vue";
const supplyPanel = useSupplyPanelStore();

const mainRadar = useMainRadarStore();
const targetRadar = useTargetRadarStore()

const targetLinePoints = computed(() => {
  if (!targetRadar.capturedTarget) return [];
  // Out of window
  if (!targetRadar.isCapturedDistance && Math.abs(targetRadar.capturedTarget.distance - targetRadar.targetCursorDistance) > SAM_PARAMS.RADAR_DISTANCE_WINDOW) return [];
  const offsetDistance = targetRadar.isCapturedDistance
    ? 0
    : (targetRadar.capturedTarget.distance - targetRadar.targetCursorDistance);
  const offsetDistanceK = 2 *offsetDistance / SAM_PARAMS.RADAR_DISTANCE_WINDOW;
  const offsetDistanceCanvas = offsetDistanceK * 180 + 180;
  const canvasDistanceAccuracy = 360 * SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / 2;
  if (
    (offsetDistanceCanvas - canvasDistanceAccuracy/2) < 0
    || (offsetDistanceCanvas + canvasDistanceAccuracy/2) > 360
  ) return [];
  return [
    0, 180,
    offsetDistanceCanvas - canvasDistanceAccuracy/2, 180,
    offsetDistanceCanvas -canvasDistanceAccuracy/2, 20,
    offsetDistanceCanvas + canvasDistanceAccuracy/2, 20,
    offsetDistanceCanvas + canvasDistanceAccuracy/2, 180,
    360, 180
  ] 
})
</script>