<template>
  <v-group :config="{
    x: 0,
    y: 160,
  }">
    <v-rect :config="{
      name: 'panel',
      x: 0,
      y: 0,
      width: 800,
      height: 740,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <SAMButton :x="730" :y="20" name="scale120km" label="120 км" :value="mainRadar.maxDisplayedDistance === 120"
      @click="mainRadar.setMaxDisplayedDistance(120)" />
    <SAMButton :x="730" :y="85" name="scale60km" label="60 км" :value="mainRadar.maxDisplayedDistance === 60"
      @click="mainRadar.setMaxDisplayedDistance(60)" />
    <SAMButton :x="730" :y="150" name="scale30km" label="30 км" :value="mainRadar.maxDisplayedDistance === 30"
      @click="mainRadar.setMaxDisplayedDistance(30)" />

    <SAMButton :x="730" :y="250" name="mainRadarMode" :value="mainRadar.viewMode === ViewModes.MainRadar" label="СОЦ"
      @click="mainRadar.setViewMode(ViewModes.MainRadar)" />
    <SAMButton :x="730" :y="315" name="targetRadarMode" :value="mainRadar.viewMode === ViewModes.TargetRadar"
      label="ССЦ" @click="openTargetRadar" />
    <SAMButton :x="730" :y="380" name="tvRadarMode" :value="mainRadar.viewMode === ViewModes.Television"
      label="ТОВ" @click="mainRadar.setViewMode(ViewModes.Television)" />

    <SAMButton :x="730" :y="530" name="captureA" :value="targetRadar.isCapturedAzimut" label="АС β"
      @click="captureByAzimut" />
    <SAMButton :x="730" :y="595" name="captureE" :value="targetRadar.isCapturedElevation" label="АС ε"
      @click="targetRadar.captureByElevation" />
    <SAMButton :x="730" :y="660" name="captureD" :value="targetRadar.isCapturedDistance" label="АС r"
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