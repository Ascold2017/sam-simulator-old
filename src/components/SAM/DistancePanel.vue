<template>
  <vk-group :config="{ x: 810, y: 190 }">
    <vk-rect :config="{
      name: 'panelDistance',
      x: 0,
      y: 0,
      width: 600,
      height: 300,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <vk-rect :config="{
      name: 'distanceDisplay',
      x: 20,
      y: 20,
      width: 480,
      height: 260,
      fill: 'black',
    }" />
    <!-- Targets and lines-->
    <vk-group v-if="supplyPanel.isEnabledPower" :config="{ x: 20, y: 20 }">
      <vk-text :config="{
        x: 5,
        y: 5,
        text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
        fontFamily: 'Russo One, sans-serif',
        fontSize: 9,
        fill: 'rgb(150, 249, 123)',
      }" />
      <vk-group v-if="supplyPanel.isEnabledTargetRadarTransmitter && !targetRadarStore.isEquivalent">
        <!-- Targets on max distance range track -->
        <vk-line v-for="canvasTarget in canvasTargets" :config="{
          points: [
            canvasTarget.offsetX, canvasHeight / 4 + paddingY,
            canvasTarget.offsetX, canvasHeight / 4 + paddingY - canvasTarget.height,
            //canvasTarget.offsetX + canvasTarget.width, canvasHeight/2 - canvasTarget.height,
            canvasTarget.offsetX + canvasTarget.width, canvasHeight / 4 + paddingY,
          ],
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5
        }" />
        <!-- Missiles on max distance range track -->
        <vk-line v-for="canvasMissile in canvasMissiles" :config="{
          points: [
            canvasMissile.offsetX, canvasHeight / 4 + paddingY,
            canvasMissile.offsetX, canvasHeight / 4 + paddingY + canvasMissile.height,
            //canvasTarget.offsetX + canvasTarget.width, canvasHeight/2 - canvasTarget.height,
            canvasMissile.offsetX + canvasMissile.width, canvasHeight / 4 + paddingY,
          ],
          stroke: 'red',
          strokeWidth: 0.5
        }" />
        <!-- Targets on window track -->
        <vk-line v-for="canvasTarget in canvasTargets" :config="{
          points: canvasTarget.isInWindow ? [
            canvasTarget.offsetXInWindow, canvasHeight / 1.5 + paddingY,
            canvasTarget.offsetXInWindow, canvasHeight / 1.5 + paddingY - canvasTarget.height,
            // canvasTarget.offsetXInWindow + canvasTarget.widthInWindow, canvasHeight - canvasTarget.height,
            canvasTarget.offsetXInWindow + canvasTarget.widthInWindow, canvasHeight / 1.5 + paddingY,
          ] : [],
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5,
        }" />
        <!-- missiles on window track -->
        <vk-line v-for="canvasMissile in canvasMissiles" :config="{
          points: canvasMissile.isInWindow ? [
            canvasMissile.offsetXInWindow,  canvasHeight / 1.5 + paddingY,
            canvasMissile.offsetXInWindow,  canvasHeight / 1.5 + paddingY + canvasMissile.height,
            // canvasTarget.offsetXInWindow + canvasTarget.widthInWindow, canvasHeight - canvasTarget.height,
            canvasMissile.offsetXInWindow + canvasMissile.widthInWindow,  canvasHeight / 1.5 + paddingY,
          ] : [],
          stroke: 'red',
          strokeWidth: 0.5,
        }" />
      </vk-group>
      <!-- Zero line -->
      <vk-line v-if="supplyPanel.isEnabledPower" :config="{
        points: [
          paddingX, canvasHeight / 4 + paddingY,
          canvasWidth - paddingX, canvasHeight / 4 + paddingY,
        ],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5
      }" />
      <!-- Zero line on window track -->
      <vk-line v-if="supplyPanel.isEnabledPower" :config="{
        points: [
          paddingX, canvasHeight/1.5 + paddingY,
          canvasWidth - paddingX,
          canvasHeight/1.5 + paddingY
        ],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5
      }" />

      <!-- Distance window on max distance track -->
      <vk-group v-if="supplyPanel.isEnabledPower" :config="{ x: canvasOffsetDistanceWindow + paddingX, y: paddingY }">
        <vk-line :config="{
          points: [
            0, canvasHeight / 4 ,
            0, 0
          ],
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5,
          dash: [2, 2]
        }" />
        <vk-line :config="{
          points: [
            canvasWindowWidth, canvasHeight / 4,
            canvasWindowWidth, 0
          ],
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5,
          dash: [2, 2]
        }" />
      </vk-group>
    </vk-group>

    <!-- capturing site -->
    <vk-group :config="{ x: (canvasWidth + paddingX + 20) / 2 + canvasCaptureWidth / 2, y: ( canvasHeight/2 + paddingY + 20) }">
      <vk-line :config="{
        points: [
          0, canvasHeight / 4 + paddingY,
          0, 0
        ],
        stroke: 'white',
        strokeWidth: 0.5
      }" />
      <vk-line :config="{
        points: [
          canvasCaptureWidth, canvasHeight / 4 + paddingY,
          canvasCaptureWidth, 0
        ],
        stroke: 'white',
        strokeWidth: 0.5
      }" />
    </vk-group>

    <!-- Track panel -->
    <vk-group :config="{ x: 520, y: 20 }">
      <SAMPotentiometer :x="5" :y="0" @change="targetRadarStore.incrementTargetCursorDistance" :deltaValue="0.1" />

      <vk-text :config="{
        x: 0,
        y: 105,
        width: 20,
        text: 'Д',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <vk-circle :config="{
        name: 'captureDistanceIndicator',
        x: 35,
        y: 110,
        width: 20,
        height: 20,
        fill: targetRadarStore.isCapturedDistance ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />

      <SAMButton :x="0" :y="135" name="captureD" :value="targetRadarStore.isCapturedDistance" label="АС Д"
        @click="targetRadarStore.captureByDistance" />
      <SAMButton :x="0" :y="200" name="resetCaptureD" :value="!targetRadarStore.isCapturedDistance" label="Сброс"
        @click="targetRadarStore.resetCaptureDistance" />
    </vk-group>


  </vk-group>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import SAMPotentiometer from "./SAMPotentiometer.vue";
import SAMButton from "./SAMButton.vue";
import { useTargetRadarStore } from '@/store/targetRadar'
import { useSupplyPanelStore } from "@/store/supplyPanel";
import { useTargetsStore } from "@/store/targets";
import SAM_PARAMS from '@/const/SAM_PARAMS';

const targetRadarStore = useTargetRadarStore();
const supplyPanel = useSupplyPanelStore();
const targetsStore = useTargetsStore();

const canvasHeight = 220;
const canvasWidth = 460
const paddingX = 20;
const paddingY = 20;
const canvasWindowWidth = (SAM_PARAMS.RADAR_DISTANCE_WINDOW / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX);
const canvasOffsetDistanceWindow = computed(() => ((targetRadarStore.targetCursorDistance - SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2) / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX))
const canvasCaptureWidth = (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX);
const canvasTargets = computed(() => {
  if (!supplyPanel.isEnabledTargetRadarTransmitter) return []
  return targetsStore.targetsInRay.map(target => {
    const offsetElevation = targetRadarStore.isCapturedDirection
      ? 0
      : (target.elevation - targetRadarStore.targetCursorElevation);

    const offsetElevationK = 2 * offsetElevation / SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT;
    const azimutOffsetK = 1 - 2 * Math.abs(targetRadarStore.targetCursorAngle - target.azimuth) / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH;
    const spotHeight = target.visibilityK * azimutOffsetK * (1 - Math.abs(offsetElevationK)) * targetRadarStore.brightness * (canvasHeight/4);
    const offsetXInWindow = ((target.distance - targetRadarStore.targetCursorDistance) / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX) + (canvasWidth - paddingX) / 2
    const offsetX = (target.distance / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX);
    return {
      height: spotHeight,
      width: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX),
      widthInWindow: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX),
      offsetXInWindow: offsetXInWindow + paddingX,
      offsetX: offsetX + paddingX,
      isInWindow: Math.abs(target.distance - targetRadarStore.targetCursorDistance) <= SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2
    }
  })
})

const canvasMissiles = computed(() => {
  if (!supplyPanel.isEnabledTargetRadarTransmitter) return []
  return targetsStore.missiles.map(missile => {

    const distance = Math.sqrt(missile.x ** 2 + missile.y ** 2)
    const offsetXInWindow = ((distance - targetRadarStore.targetCursorDistance) / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX) + (canvasWidth - paddingX) / 2
    const offsetX = (distance / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX);
    return {
      height: canvasHeight / 6,
      width: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX),
      widthInWindow: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX),
      offsetXInWindow: offsetXInWindow + paddingX,
      offsetX: offsetX + paddingX,
      isInWindow: Math.abs(distance - targetRadarStore.targetCursorDistance) <= SAM_PARAMS.RADAR_DISTANCE_WINDOW / 2
    }
  })
})
</script>