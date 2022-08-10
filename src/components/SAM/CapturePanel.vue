<template>
  <v-group :config="{
    x: 1020,
    y: 740,
  }">
    <v-rect :config="{
      name: 'panelCapture',
      x: 0,
      y: 0,
      width: 400,
      height: 120,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />
    <v-line :config="{ points: [20, 20, 130, 20], stroke: '#181818', shadowBlur: 2 }" />
    <v-text :config="{
      x: 140,
      y: 10,
      width: 130,
      height: 20,
    
      text: 'Режим автозахвата',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
    }" />
    <v-line :config="{ points: [280, 20, 380, 20], stroke: '#181818', shadowBlur: 2 }" />
    <SAMButton :x="20" :y="35" name="manual" label="Ручн" :value="captureMode === 'manual'" @click="captureMode = 'manual'" />
    <v-circle :config="{ y: 65, x: 135, width: 20, height: 20, shadowBlur: 5, fill: 'red' }" />
    <SAMButton :x="190" :y="35" name="rls" label="РЛС" :value="captureMode === 'rls'" @click="captureMode = 'rls'" />
    <SAMButton :x="255" :y="35" name="ols" label="ОЛС" :value="captureMode === 'ols'" @click="captureMode = 'ols'" />
    <SAMButton :x="320" :y="35" name="jamming" label="Помеха" :value="captureMode === 'jamming'" @click="captureMode = 'jamming'" />
  </v-group>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import SAMButton from './SAMButton.vue';
const captureMode = ref('rls')
</script>