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

    <v-rect :config="{
      name: 'display',
      x: 20,
      y: 20,
      width: 360,
      height: 180,
      fill: 'black'
    }" />

    <v-line :config="{ points: [180, 30, 180, 190], stroke: 'white' }" />
    <v-line :config="{ points: [220, 30, 220, 190], stroke: 'white' }" />

    <SAMPotentiometer :x="20" :y="215" />

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
      fill: isCaptured ? 'rgb(150, 249, 123)' : 'red',
      shadowBlur: 5
    }" />

    <SAMButton :x="255" :y="210" name="resetCapture" :value="isCaptured" label="АС" />
    <SAMButton :x="320" :y="210" name="resetCapture" :value="!isCaptured" label="Сброс" />
  </v-group>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SAMButton from "./SAMButton.vue";
import SAMPotentiometer from "./SAMPotentiometer.vue";
const isCaptured = ref(false)
</script>