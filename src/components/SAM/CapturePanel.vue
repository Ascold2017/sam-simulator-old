<template>
  <vk-group :config="{
    x: 810,
    y: 500,
  }">
    <vk-rect :config="{
      name: 'panelCapture',
      x: 0,
      y: 0,
      width: 600,
      height: 120,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <vk-group :config="{ x: 20, y: 20 }">
    <vk-line :config="{ points: [0, 5, 40, 5], stroke: '#181818', shadowBlur: 2 }" />
    <vk-text :config="{
      x: 50,
      y: -5,
      offsetX: 20,
      width: 130,
      height: 20,
      text: 'Режим захвата',
      fontFamily: 'Russo One, sans-serif',
      fill: '#181818',
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
    }" />
    <vk-line :config="{ points: [160, 5, 200, 5], stroke: '#181818', shadowBlur: 2 }" />
    <SAMButton :x="0" :y="20" name="manual" label="Ручн" :value="capturePanel.captureMode === CaptureModes.Manual"
      @click="capturePanel.setCaptureMode(CaptureModes.Manual)" />
    <SAMButton :x="70" :y="20" name="designation" label="ЦУ" :value="capturePanel.captureMode === CaptureModes.Designation"
      @click="capturePanel.setCaptureMode(CaptureModes.Designation)" />
    <SAMButton
        label="Сброс"
        :x="140"
        :y="20"
        name="asc"
        :value="!targetRadar.isCapturedAll"
        @click="targetRadar.resetCaptureAll"
      />
    </vk-group>
    
    <vk-line :config="{ points: [230, 15, 230, 100], stroke: '#181818', shadowBlur: 2 }" />

    <vk-group :config="{ x: 240, y: 20}">
       <SAMButton :x="0" :y="20" name="captureDir" :value="targetRadar.isCapturedDirection" label="АС ϕ"
      @click="targetRadar.captureByDirection" />
      </vk-group>
    <vk-line :config="{ points: [310, 15, 310, 100], stroke: '#181818', shadowBlur: 2 }" />
    <vk-group :config="{ x: 320, y: 20}">
      <vk-text :config="{
        x: 0, y: 0,
        text: 'Эквивалент',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
      }" />
      <SAMButton :x="0" :y="40" name="antenna" label="Ант" :value="!targetRadar.isEquivalent" small @click="targetRadar.setEquivalent(false)" />
      <SAMButton :x="45" :y="40" name="equivalent" label="Экв" :value="targetRadar.isEquivalent" small @click="targetRadar.setEquivalent(true)"/>
    </vk-group>
    
  </vk-group>
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