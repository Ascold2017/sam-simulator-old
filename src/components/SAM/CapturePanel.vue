<template>
  <v-group :config="{
    x: 810,
    y: 190,
  }">
    <v-rect :config="{
      name: 'panelCapture',
      x: 0,
      y: 0,
      width: 600,
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
        label="Сброс"
        :x="230"
        :y="15"
        name="asc"
        :value="!targetRadar.isCapturedAzimut"
        @click="targetRadar.resetCaptureAll"
      />
    </v-group>

    <v-line :config="{ points: [20, 85, 80, 85], stroke: '#181818', shadowBlur: 2 }" />
    <v-text :config="{
      x: 87.5,
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
    <v-line :config="{ points: [225, 85, 290, 85], stroke: '#181818', shadowBlur: 2 }" />
    <SAMButton :x="20" :y="100" name="manual" label="Ручн" :value="capturePanel.captureMode === CaptureModes.Manual"
      @click="capturePanel.setCaptureMode(CaptureModes.Manual)" />
    <SAMButton :x="90" :y="100" name="rls" label="РЛС" :value="capturePanel.captureMode === CaptureModes.Radio"
      @click="capturePanel.setCaptureMode(CaptureModes.Radio)" />
    <SAMButton :x="160" :y="100" name="ols" label="ОЛС" :value="capturePanel.captureMode === CaptureModes.Optical"
      @click="capturePanel.setCaptureMode(CaptureModes.Optical)" />
    <SAMButton :x="230" :y="100" name="jamming" label="Помеха"
      :value="capturePanel.captureMode === CaptureModes.Jamming"
      @click="capturePanel.setCaptureMode(CaptureModes.Jamming)" />
    
    <v-line :config="{ points: [300, 15, 300, 160], stroke: '#181818', shadowBlur: 2 }" />
    <v-group :config="{ x: 310, y: 20}">
      <v-text :config="{
        x: 0, y: 0,
        text: 'Режим антенны',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
      }" />
      <SAMButton :x="0" :y="20" name="antenna" label="Ант" :value="!mainRadar.isEquivalent" small @click="mainRadar.setEquivalent(false)" />
      <SAMButton :x="45" :y="20" name="equivalent" label="Экв" :value="mainRadar.isEquivalent" small @click="mainRadar.setEquivalent(true)"/>
    </v-group>
    <v-group :config="{ x: 310, y: 100 }">
       <v-text :config="{
        x: 0, y: 0,
        text: 'СДЦ',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
      }" />
      <SAMButton :x="0" :y="20" name="sdcOn" label="Выкл" value small />
      <SAMButton :x="45" :y="20" name="sdcOff" label="Вкл" value small />
    </v-group>
    <v-group :config="{ x: 430, y: 20 }">
     <v-text :config="{
        x: 0, y: 0,
        width: 60,
        text: 'Яркость отметок',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
      }" />
        <SAMPotentiometer :x="100" :y="0" :delta-value="0.1" @change="mainRadar.incrementBrightness" />
    </v-group>
    <v-group :config="{ x: 430, y: 110 }">
     <v-text :config="{
        x: 0, y: 0,
        width: 60,
        text: 'Размер отметок',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
      }" />
        <SAMPotentiometer :x="100" :y="0" :delta-value="50" @change="mainRadar.incrementGain" />
    </v-group>
  </v-group>
</template>
<script setup lang="ts">
import { useCapturePanelStore, CaptureModes } from '@/store/capturePanel';
import { useMainRadarStore } from '@/store//mainRadarPanel';
import { useTargetRadarStore } from '@/store/targetRadar'
import SAMButton from './SAMButton.vue'
import SAMPotentiometer from './SAMPotentiometer.vue'

const mainRadar = useMainRadarStore()
const targetRadar = useTargetRadarStore()
const capturePanel = useCapturePanelStore()
</script>