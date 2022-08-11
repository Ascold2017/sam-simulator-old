<template>
  <v-group :config="{ x: 0, y: 0, name: 'distancePanel' }">
    <v-rect :config="{
      name: 'panel',
      x: 0,
      y: 0,
      width: 400,
      height: 290,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <DistanceDisplay /> 

    <v-text :config="{
      x: 180,
      y: 210,
      height: 60,
      text: 'r',
      verticalAlign: 'middle',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontStyle: 'bold',
      fontSize: 14,
    }" />
    <v-circle :config="{
      name: 'captureIndicator',
      x: 220,
      y: 240,
      width: 20,
      height: 20,
      fill: targetRadar.isCapturedDistance ? 'rgb(150, 249, 123)' : 'red',
      shadowBlur: 5
    }" />

    <SAMButton :x="255" :y="210" name="resetCapture" :value="targetRadar.isCapturedDistance" label="АС" @click="targetRadar.captureByDistance" />
    <SAMButton :x="320" :y="210" name="resetCapture" :value="!targetRadar.isCapturedDistance" label="Сброс" @click="targetRadar.resetCaptureDistance" />
  </v-group>
</template>

<script setup lang="ts">

import { useTargetRadarStore } from "@/store/targetRadar";
import SAMButton from "./SAMButton.vue";

import DistanceDisplay from "./DistanceDisplay.vue";

const targetRadar = useTargetRadarStore()
</script>