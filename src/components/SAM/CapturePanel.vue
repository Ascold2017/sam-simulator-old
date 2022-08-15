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
        text: 'ϕ',
        align: 'center',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontStyle: 'bold',
        fontSize: 14,
      }" />
      <v-circle :config="{
        name: 'captureDirectionIndicator',
        x: 30,
        y: 55,
        width: 20,
        height: 20,
        fill: targetRadar.isCapturedDirection ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <v-text :config="{
        x: 60,
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
        x: 70,
        y: 55,
        width: 20,
        height: 20,
        fill: targetRadar.isCapturedDistance ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />

       <SAMButton :x="100" :y="15" name="captureDir" :value="targetRadar.isCapturedDirection" label="АС ϕ"
      @click="targetRadar.captureByDirection" />
    <SAMButton :x="165" :y="15" name="captureD" :value="targetRadar.isCapturedDistance" label="АС r"
      @click="targetRadar.captureByDistance" />

      <SAMButton
        label="Сброс"
        :x="230"
        :y="15"
        name="asc"
        :value="!targetRadar.isCapturedAll"
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
      <SAMButton :x="0" :y="20" name="antenna" label="Ант" :value="!targetRadar.isEquivalent" small @click="targetRadar.setEquivalent(false)" />
      <SAMButton :x="45" :y="20" name="equivalent" label="Экв" :value="targetRadar.isEquivalent" small @click="targetRadar.setEquivalent(true)"/>
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