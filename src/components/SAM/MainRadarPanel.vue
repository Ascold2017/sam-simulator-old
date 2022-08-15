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

    <v-group :config="{ x: 730, y: 20 }">
     <v-text :config="{
        x: 0, y: 0,
        width: 60,
        text: 'Яркость отметок',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
        align: 'center'
      }" />
        <SAMPotentiometer :x="5" :y="30" :delta-value="0.1" @change="targetRadar.incrementBrightness" />
    </v-group>
    <v-group :config="{ x: 730, y: 120 }">
     <v-text :config="{
        x: 0, y: 0,
        width: 60,
        text: 'Размер отметок',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
        align: 'center'
      }" />
        <SAMPotentiometer :x="5" :y="30" :delta-value="50" @change="targetRadar.incrementGain" />
    </v-group>

    <SAMButton :x="730" :y="250" name="bipMode" :value="mainRadar.viewMode === ViewModes.BIP" label="БИП"
      @click="mainRadar.setViewMode(ViewModes.BIP)" />
    <SAMButton :x="730" :y="315" name="mainRadarMode" :value="mainRadar.viewMode === ViewModes.MainRadar" label="СОЦ"
      @click="mainRadar.setViewMode(ViewModes.MainRadar)" />
    <SAMButton :x="730" :y="380" name="targetRadarMode" :value="mainRadar.viewMode === ViewModes.TargetRadar"
      label="ССЦ" @click="mainRadar.setViewMode(ViewModes.TargetRadar)" />
    <SAMButton :x="730" :y="445" name="tvRadarMode" :value="mainRadar.viewMode === ViewModes.Television"
      label="ТОВ" @click="mainRadar.setViewMode(ViewModes.Television)" />

   
  </v-group>
</template>

<script setup lang="ts">
import { useMainRadarStore, ViewModes } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'
import SAMPotentiometer from './SAMPotentiometer.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()
</script>