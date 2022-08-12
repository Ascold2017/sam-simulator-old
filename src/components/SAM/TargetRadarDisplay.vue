<template>
<v-group :config="{
    x: 430,
    y: 210,
  }">
    <v-rect :config="{
      name: 'display',
      x: 0,
      y: 0,
      width: 510,
      height: 500,
      fill: supplyPanel.isEnabledPower ? 'rgb(15, 33, 19)' : 'black',
    }" />

     <v-group v-if="supplyPanel.isEnabledPower">
      <v-rect :config="{
        x: 255, y: 250,
        width: mainRadar.maxDisplayedDistance * mainRadar.scale,
        height: 100,
        stroke: 'rgb(150, 249, 123)',
        strokeWidth: 0.5,
        offsetY: 50,
        rotation: targetRadarStore.targetCursorAngle * (180/Math.PI)
      }" />
      
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { useMainRadarStore } from '@/store/mainRadarPanel';
import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useTargetRadarStore } from '@/store/targetRadar';
import { useTargetsStore } from '@/store/targets';

const supplyPanel = useSupplyPanelStore()
const mainRadar = useMainRadarStore()
const targetsStore = useTargetsStore()
const targetRadarStore = useTargetRadarStore()
</script>