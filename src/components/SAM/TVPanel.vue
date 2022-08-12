<template>
  <v-group ref="tvPanel" :config="{
    x: 810,
    y: 540,
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
      width: 320,
      height: 320,
      fill: 'black',
    }" />

    <!-- target cross -->
    <v-line :config="{
      points: [40, 180, 160, 180],
      stroke: 'white'
    }" />
    <v-line :config="{
      points: [200, 180, 320, 180],
      stroke: 'white'
    }" />
    <v-line :config="{
      points: [180, 40, 180, 160],
      stroke: 'white'
    }" />
    <v-line :config="{
      points: [180, 200, 180, 320],
      stroke: 'white'
    }" />
    <!-- end target cross -->

    <SAMButton :x="340" :y="20" name="on" label="Вкл" :value="isEnabled" @click="isEnabled = true" />
    <SAMButton :x="340" :y="85" name="on" label="Выкл" :value="!isEnabled" @click="isEnabled = false" />

    <SAMButton :x="350" :y="210" name="on" label="1X" :value="zoom === 1" small @click="zoom = 1" />
    <SAMButton :x="350" :y="255" name="on" label="2.5X" :value="zoom === 2.5" small @click="zoom = 2.5" />
    <SAMButton :x="350" :y="300" name="on" label="5X" :value="zoom === 5" small @click="zoom = 5" />

  </v-group>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SAMButton from './SAMButton.vue';
const isEnabled = ref(false)
const zoom = ref(1)
</script>