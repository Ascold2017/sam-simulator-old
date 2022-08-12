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

    <SAMButton :x="540" :y="20" name="scale80km" label="50 км" :value="mainRadar.maxDisplayedDistance === 50" @click="mainRadar.setMaxDisplayedDistance(50)" />
    <SAMButton :x="540" :y="85" name="scale50km" label="30 км" :value="mainRadar.maxDisplayedDistance === 30" @click="mainRadar.setMaxDisplayedDistance(30)" />


    <SAMButton :x="540" :y="330" name="captureA" :value="targetRadar.isCapturedAzimut"  label="АС β" @click="targetRadar.captureByAzimut" />
    <SAMButton :x="540" :y="395" name="captureE" :value="targetRadar.isCapturedElevation"  label="АС ε" @click="targetRadar.captureByElevation" />
    <SAMButton :x="540" :y="460" name="captureD" :value="targetRadar.isCapturedAzimut"  label="АС r" @click="targetRadar.captureByDistance" />
  </v-group>
</template>

<script setup lang="ts">
import { useMainRadarStore } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()

</script>