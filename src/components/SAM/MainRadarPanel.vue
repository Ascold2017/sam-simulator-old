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

    <SAMButton :x="730" :y="250" name="mainRadarMode" :value="mainRadar.viewMode === ViewModes.MainRadar" label="СОЦ"
      @click="mainRadar.setViewMode(ViewModes.MainRadar)" />
    <SAMButton :x="730" :y="315" name="targetRadarMode" :value="mainRadar.viewMode === ViewModes.TargetRadar"
      label="ССЦ" @click="openTargetRadar" />
    <SAMButton :x="730" :y="380" name="tvRadarMode" :value="mainRadar.viewMode === ViewModes.Television"
      label="ТОВ" @click="mainRadar.setViewMode(ViewModes.Television)" />

    <SAMButton :x="730" :y="595" name="captureDir" :value="targetRadar.isCapturedDirection" label="АС ϕ"
      @click="targetRadar.captureByDirection" />
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
  mainRadar.setViewMode(ViewModes.TargetRadar)
}

</script>