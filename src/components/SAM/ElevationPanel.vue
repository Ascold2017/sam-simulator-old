<template>
  <v-group :config="{
    name: 'elevationPanel',
    x: 1020,
    y: 370,
  }">
    <v-rect :config="{
      name: 'panel',
      x: 0,
      y: 0,
      width: 400,
      height: 360,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <v-rect :config="{
      name: 'display',
      x: 20,
      y: 20,
      width: 300,
      height: 320,
      fill: 'black'
    }" />

    <v-line :config="{ points: [30, 160, 310, 160], stroke: 'white' }" />
    <v-line :config="{ points: [30, 200, 310, 200], stroke: 'white' }" />

    <SAMPotentiometer :x="335" :y="20" />

    <v-text :config="{
      x: 330,
      y: 150,
      width: 60,
      text: 'ε',
      align: 'center',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontStyle: 'bold',
      fontSize: 14,
    }" />

    <v-circle :config="{
      name: 'captureIndicator',
      x: 360,
      y: 190,
      width: 20,
      height: 20,
      fill: isCaptured ? 'rgb(150, 249, 123)' : 'red',
      shadowBlur: 5
    }" />

    <SAMButton :x="330" :y="215" :value="isCaptured" label="АС" name="capture" />
    <SAMButton :x="330" :y="280" :value="!isCaptured" label="Сброс" name="resetCapture" />

  </v-group>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SAMButton from "./SAMButton.vue";
import SAMPotentiometer from "./SAMPotentiometer.vue";
const isCaptured = ref(false)
</script>