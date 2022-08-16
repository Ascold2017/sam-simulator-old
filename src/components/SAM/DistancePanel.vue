<template>
  <v-group :config="{ x: 810, y: 190 }">
    <v-rect :config="{
      name: 'panelDistance',
      x: 0,
      y: 0,
      width: 600,
      height: 300,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <v-rect :config="{
      name: 'distanceDisplay',
      x: 20,
      y: 20,
      width: 480,
      height: 260,
      fill: 'black',
    }" />

    <v-group v-if="supplyPanel.isEnabledPower && supplyPanel.isEnabledTargetRadarTransmitter && !targetRadarStore.isEquivalent" :config="{ x: 20, y: 20}">
      <v-text :config="{
      x: 5,
      y: 5,
      text: `Дальность: ${targetRadarStore.targetCursorDistance.toFixed(1)} км`,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 9,
      fill: 'rgb(150, 249, 123)',
    }" />
      <v-line v-for="canvasTarget in canvasTargets" :config="{
        points: [
          canvasTarget.offsetX, canvasHeight/2,
          canvasTarget.offsetX, canvasHeight/2 - canvasTarget.height,
          //canvasTarget.offsetX + canvasTarget.width, canvasHeight/2 - canvasTarget.height,
          canvasTarget.offsetX + canvasTarget.width, canvasHeight/2,
        ],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5
      }" />
      <v-line :config="{
        points: [
          paddingX, canvasHeight/2,
          canvasWidth - paddingX, canvasHeight/2
        ],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5
      }" />
      <!-- Distance window -->
      <v-group :config="{ x: canvasOffsetDistanceWindow + paddingX, y: paddingY }">
        <v-line :config="{
          points: [
            0, canvasHeight/2 - paddingY,
            0, 0
          ],
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5,
          dash: [2, 2]
        }"
        />
         <v-line :config="{
          points: [
            canvasWindowWidth, canvasHeight/2 - paddingY,
            canvasWindowWidth, 0
          ], 
          stroke: 'rgba(150, 249, 123, 1)',
          strokeWidth: 0.5,
          dash: [2, 2]
        }"
        />
      </v-group>

      <v-line v-for="canvasTarget in canvasTargets" :config="{
        points: canvasTarget.isInWindow ? [
          canvasTarget.offsetXInWindow, canvasHeight,
          canvasTarget.offsetXInWindow, canvasHeight - canvasTarget.height,
          // canvasTarget.offsetXInWindow + canvasTarget.widthInWindow, canvasHeight - canvasTarget.height,
          canvasTarget.offsetXInWindow + canvasTarget.widthInWindow, canvasHeight,
        ] : [],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5,
      }" />
      
      <v-line :config="{
        points: [
          paddingX, canvasHeight,
          canvasWidth - paddingX,
          canvasHeight
        ],
        stroke: 'rgba(150, 249, 123, 1)',
        strokeWidth: 0.5
      }" />

      <v-group :config="{ x: canvasWidth/2 + canvasCaptureWidth/2, y: canvasHeight/2 }">
      <v-line :config="{
        points: [
          0, canvasHeight/2,
          0, paddingY
        ],
        stroke: 'white',
        strokeWidth: 0.5
      }" />
      <v-line :config="{
        points: [
          canvasCaptureWidth, canvasHeight/2,
          canvasCaptureWidth, paddingY
        ],
        stroke: 'white',
        strokeWidth: 0.5
      }" />
      </v-group>
    </v-group>

    <v-group :config="{ x: 520, y: 20 }">
      <SAMPotentiometer :x="5" :y="0" @change="targetRadarStore.incrementTargetCursorDistance" :deltaValue="0.1" />

      <v-text :config="{
        x: 20,
        y: 75,
        width: 20,
        text: 'r',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <v-circle :config="{
        name: 'captureDistanceIndicator',
        x: 30,
        y: 110,
        width: 20,
        height: 20,
        fill: targetRadarStore.isCapturedDistance ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />

      <SAMButton :x="0" :y="135" name="captureD" :value="targetRadarStore.isCapturedDistance" label="АС r"
        @click="targetRadarStore.captureByDistance" />
      <SAMButton :x="0" :y="200" name="resetCaptureD" :value="!targetRadarStore.isCapturedDistance" label="Сброс"
        @click="targetRadarStore.resetCaptureDistance" />
    </v-group>


  </v-group>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import SAMPotentiometer from "./SAMPotentiometer.vue";
import SAMButton from "./SAMButton.vue";
import { useTargetRadarStore } from '@/store/targetRadar'
import { useSupplyPanelStore } from "@/store/supplyPanel";
import { useTargetsStore } from "@/store/targets";
import { SAM_PARAMS } from "@/classes/SAM";

const targetRadarStore = useTargetRadarStore();
const supplyPanel = useSupplyPanelStore();
const targetsStore = useTargetsStore();

const canvasHeight = 220;
const canvasWidth = 460
const paddingX = 20;
const paddingY = 20;
const canvasWindowWidth = (SAM_PARAMS.RADAR_DISTANCE_WINDOW/SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX);
const canvasOffsetDistanceWindow = computed(() => ((targetRadarStore.targetCursorDistance - SAM_PARAMS.RADAR_DISTANCE_WINDOW/2) / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX))
const canvasCaptureWidth = (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY/SAM_PARAMS.RADAR_DISTANCE_WINDOW)* (canvasWidth - paddingX);
const canvasTargets = computed(() => {
 if (!supplyPanel.isEnabledTargetRadarTransmitter) return []
  return targetsStore.targetsInRay.map(target => {
    const offsetElevation = targetRadarStore.isCapturedDirection
        ? 0
        : (target.elevation - targetRadarStore.targetCursorElevation);

      const offsetElevationK = 2 * offsetElevation / SAM_PARAMS.TARGET_RADAR_RAY_HEIGHT;
      const azimutOffsetK = 1 - 2 * Math.abs(targetRadarStore.targetCursorAngle - target.azimut) / SAM_PARAMS.TARGET_RADAR_RAY_WIDTH;
      const spotHeight = target.visibilityK * azimutOffsetK * (1 - Math.abs(offsetElevationK)) * targetRadarStore.brightness * (canvasHeight - paddingY);
      const offsetXInWindow =  ((target.distance - targetRadarStore.targetCursorDistance) / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX) + (canvasWidth - paddingX)/2
      const offsetX = (target.distance / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX);
      return {
        height: spotHeight / 2,
        width: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.MAX_DISTANCE) * (canvasWidth - paddingX),
        widthInWindow: (SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / SAM_PARAMS.RADAR_DISTANCE_WINDOW) * (canvasWidth - paddingX),
        offsetXInWindow: offsetXInWindow + paddingX,
        offsetX: offsetX + paddingX,
        isInWindow: Math.abs(target.distance - targetRadarStore.targetCursorDistance) <= SAM_PARAMS.RADAR_DISTANCE_WINDOW/2
      }
  })
})
</script>