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
    <SOCDisplay />

    <SAMButton :x="540" :y="20" name="scale80km" label="80 км" :value="mainRadar.maxDisplayedDistance === 80" @click="mainRadar.setMaxDisplayedDistance(80)" />
    <SAMButton :x="540" :y="85" name="scale50km" label="50 км" :value="mainRadar.maxDisplayedDistance === 50" @click="mainRadar.setMaxDisplayedDistance(50)" />
    <SAMButton :x="540" :y="150" name="scale30km" label="30 км" :value="mainRadar.maxDisplayedDistance === 30" @click="mainRadar.setMaxDisplayedDistance(30)" />

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
      fill: false ? 'rgb(150, 249, 123)': 'red',
      shadowBlur: 5
    }" />

    <SAMButton :x="540" :y="395" name="capture" :value="targetRadar.isCapturedAzimut"  label="АС" @click="targetRadar.captureByAzimut" />
    <SAMButton :x="540" :y="460" name="resetCapture" :value="!targetRadar.isCapturedAzimut" label="Сброс" @click="targetRadar.resetCaptureAll"/>
  </v-group>
</template>

<script setup lang="ts">
import { useMainRadarStore } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'
import SOCDisplay from './SOCDisplay.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()

</script>