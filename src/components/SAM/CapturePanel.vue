<template>
  <v-group :config="{
    x: 1020,
    y: 370,
  }">
    <v-rect :config="{
      name: 'panelCapture',
      x: 0,
      y: 0,
      width: 400,
      height: 180,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <v-group>
      <v-text :config="{
        x: 20,
        y: 15,
        width: 20,
        text: 'β',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <v-circle :config="{
        name: 'captureAzimutIndicator',
        x: 30,
        y: 55,
        width: 20,
        height: 20,
        fill: targetRadar.isCapturedAzimut ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <v-text :config="{
        x: 105,
        y: 15,
        width: 20,
        text: 'ε',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <v-circle :config="{
        name: 'captureElevationIndicator',
        x: 115,
        y: 55,
        width: 20,
        height: 20,
        fill: targetRadar.isCapturedElevation ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <v-text :config="{
        x: 190,
        y: 15,
        width: 20,
        text: 'r',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <v-circle :config="{
        name: 'captureDistanceIndicator',
        x: 200,
        y: 55,
        width: 20,
        height: 20,
        fill: targetRadar.isCapturedDistance ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />

      <SAMButton
        :value="targetRadar.isCapturedAzimut && targetRadar.isCapturedElevation && targetRadar.isCapturedDistance"
        label="АСЦ"
        :x="255"
        :y="15"
        name="asc"
      />
      <SAMButton
        label="Сброс"
        :x="320"
        :y="15"
        name="asc"
        :value="!targetRadar.isCapturedAzimut"
        @click="targetRadar.resetCaptureAll"
      />
    </v-group>

    <v-line :config="{ points: [20, 85, 130, 85], stroke: '#181818', shadowBlur: 2 }" />
    <v-text :config="{
      x: 140,
      y: 75,
      width: 130,
      height: 20,
      text: 'Режим автозахвата',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
    }" />
    <v-line :config="{ points: [280, 85, 380, 85], stroke: '#181818', shadowBlur: 2 }" />
    <SAMButton :x="20" :y="100" name="manual" label="Ручн" :value="capturePanel.captureMode === CaptureModes.Manual"
      @click="capturePanel.setCaptureMode(CaptureModes.Manual)" />
    <SAMButton :x="190" :y="100" name="rls" label="РЛС" :value="capturePanel.captureMode === CaptureModes.Radio"
      @click="capturePanel.setCaptureMode(CaptureModes.Radio)" />
    <SAMButton :x="255" :y="100" name="ols" label="ОЛС" :value="capturePanel.captureMode === CaptureModes.Optical"
      @click="capturePanel.setCaptureMode(CaptureModes.Optical)" />
    <SAMButton :x="320" :y="100" name="jamming" label="Помеха"
      :value="capturePanel.captureMode === CaptureModes.Jamming"
      @click="capturePanel.setCaptureMode(CaptureModes.Jamming)" />
  </v-group>
</template>
<script setup lang="ts">
import { useCapturePanelStore, CaptureModes } from '@/store/capturePanel';
import { useMainRadarStore } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()
const capturePanel = useCapturePanelStore()
</script>