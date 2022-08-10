<template>
  <v-group :config="{
    x: 410,
    y: 190,
  }">
    <v-rect :config="{
      name: 'panel',
      x: 0,
      y: 0,
      width: 600,
      height: 540,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />
    <v-rect :config="{
      name: 'display',
      x: 20,
      y: 20,
      width: 510,
      height: 500,
      fill: isEnabled ? 'rgb(15, 33, 19)' : 'black',
    }" />

    <SAMButton :x="540" :y="20" name="scale50km" label="50 км" :value="scale === 50" @click="scale = 50" />
    <SAMButton :x="540" :y="85" name="scale30km" label="30 км" :value="scale === 30" @click="scale = 30" />
    <SAMButton :x="540" :y="150" name="scale15km" label="15 км" :value="scale === 15" @click="scale = 15" />

    <SAMButton :x="540" :y="250" name="asc" label="АСЦ" :value="false" />


    <v-text :config="{
      x: 540,
      y: 330,
      width: 60,
      text: 'β',
      align: 'center',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontStyle: 'bold',
      fontSize: 14,
    }" />
    <v-circle :config="{
      name: 'captureIndicator',
      x: 570,
      y: 370,
      width: 20,
      height: 20,
      fill: isCaptured ? 'rgb(150, 249, 123)': 'red',
      shadowBlur: 5
    }" />

    <SAMButton :x="540" :y="395" name="capture" :value="isCaptured" @click="isCaptured = true" label="АС" />
    <SAMButton :x="540" :y="460" name="resetCapture" :value="!isCaptured" @click="isCaptured = false" label="Сброс" />
  </v-group>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SAMButton from './SAMButton.vue'

const isEnabled = ref(false)
const isCaptured = ref(false)
const scale = ref(50)

</script>