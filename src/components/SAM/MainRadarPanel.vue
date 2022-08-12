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

    <SAMButton :x="540" :y="20" name="scale50km" label="50 км" :value="mainRadar.maxDisplayedDistance === 50"
      @click="mainRadar.setMaxDisplayedDistance(50)" />
    <SAMButton :x="540" :y="85" name="scale30km" label="30 км" :value="mainRadar.maxDisplayedDistance === 30"
      @click="mainRadar.setMaxDisplayedDistance(30)" />

    <SAMButton :x="540" :y="170" name="mainRadarMode" :value="mainRadar.viewMode === ViewModes.MainRadar" label="СОЦ"
      @click="mainRadar.setViewMode(ViewModes.MainRadar)" />
    <SAMButton :x="540" :y="235" name="targetRadarMode" :value="mainRadar.viewMode === ViewModes.TargetRadar"
      label="ССЦ" @click="openTargetRadar" />

    <SAMButton :x="540" :y="330" name="captureA" :value="targetRadar.isCapturedAzimut" label="АС β"
      @click="captureByAzimut" />
    <SAMButton :x="540" :y="395" name="captureE" :value="targetRadar.isCapturedElevation" label="АС ε"
      @click="targetRadar.captureByElevation" />
    <SAMButton :x="540" :y="460" name="captureD" :value="targetRadar.isCapturedDistance" label="АС r"
      @click="targetRadar.captureByDistance" />
  </v-group>
</template>

<script setup lang="ts">
import { useMainRadarStore, ViewModes } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()

const openTargetRadar = () => {
  if (!targetRadar.isCapturedAzimut) return;
  mainRadar.setViewMode(ViewModes.TargetRadar)
}

const captureByAzimut = () => {
  targetRadar.captureByAzimut();
  openTargetRadar()
}
</script>