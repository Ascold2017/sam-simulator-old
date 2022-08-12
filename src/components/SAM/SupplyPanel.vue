<template>
  <v-group :config="{
    x: 0,
    y: 0,
  }">
    <v-rect :config="{
      x: 0,
      y: 0,
      width: 400,
      height: 500,
      fill: 'grey', shadowBlur: 10, cornerRadius: 6,
    }" />
    <!-- Power -->
    <v-group :config="{ x: 20, y: 20 }">
      <v-text :config="{
        x: 0,
        y: 0,
        height: 60,
        verticalAlign: 'middle',
        text: 'Питание',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 13
      }" />
      <v-circle :config="{
        name: 'powerIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledPower ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="powerOn" :value="supplyPanel.isEnabledPower"
        @click="supplyPanel.setEnabledPower(true)" />
      <SAMButton label="Выкл" :x="300" :y="0" name="powerOff" :value="!supplyPanel.isEnabledPower"
        @click="supplyPanel.setEnabledPower(false)" />
    </v-group>

    <!-- SOC mechanization -->
    <v-group :config="{ x: 20, y: 85 }">
      <v-text :config="{
        x: 0,
        y: 0,
        height: 60,
        verticalAlign: 'middle',
        text: 'Привод СОЦ',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 13
      }" />
      <v-circle :config="{
        name: 'rotationIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledRotation ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="rotationOn" :value="supplyPanel.isEnabledRotation"
        @click="supplyPanel.setEnablerRotation(true)" />
      <SAMButton label="Выкл" :x="300" :y="0" name="rotationOff" :value="!supplyPanel.isEnabledRotation"
        @click="supplyPanel.setEnablerRotation(false)" />
    </v-group>

    <!-- SOC antenna -->
    <v-group :config="{ x: 20, y: 150 }">
      <v-text :config="{
        x: 0,
        y: 0,
        height: 60,
        verticalAlign: 'middle',
        text: 'Передатчик СОЦ',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 13
      }" />
      <v-circle :config="{
        name: 'mainRadarIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledMainRadarTransmitter ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="mainRadarOn" :value="supplyPanel.isEnabledMainRadarTransmitter"
        @click="supplyPanel.setIsEnabledMainRadarTransmitter(true)" />
      <SAMButton label="Выкл" :x="300" :y="0" name="mainRadarOff" :value="!supplyPanel.isEnabledMainRadarTransmitter"
        @click="supplyPanel.setIsEnabledMainRadarTransmitter(false)" />
    </v-group>

    <!-- SNR antenna -->
    <v-group :config="{ x: 20, y: 215 }">
      <v-text :config="{
        x: 0,
        y: 0,
        height: 60,
        verticalAlign: 'middle',
        text: 'Передатчик СНР',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 13
      }" />
      <v-circle :config="{
        name: 'targetRadarIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledTargetRadarTransmitter ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="snrOn" :value="supplyPanel.isEnabledTargetRadarTransmitter"
        @click="supplyPanel.setIsEnabledTargetRadarTransmitter(true)" />
      <SAMButton label="Выкл" :x="300" :y="0" name="snrOff" :value="!supplyPanel.isEnabledTargetRadarTransmitter"
        @click="supplyPanel.setIsEnabledTargetRadarTransmitter(false)" />
    </v-group>
    <!-- OLS power -->
    <v-group :config="{ x: 20, y: 280 }">
      <v-text :config="{
        x: 0,
        y: 0,
        height: 60,
        verticalAlign: 'middle',
        text: 'Питание ОЛС',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 13
      }" />
      <v-circle :config="{
        name: 'thermalCameraIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledThermalCamera ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="thermalCameraOn" :value="supplyPanel.isEnabledThermalCamera"
        @click="supplyPanel.setIsEnabledThermalCamera(true)" />
      <SAMButton label="Выкл" :x="300" :y="0" name="thermalCameraOff" :value="!supplyPanel.isEnabledThermalCamera"
        @click="supplyPanel.setIsEnabledThermalCamera(false)" />
    </v-group>

    <v-line :config="{ points: [20, 390, 50, 390], stroke: '#181818' }" />
    <v-text :config="{
      x: 60,
      y: 380,
      width: 120,
      height: 20,
      verticalAlign: 'middle',
      align: 'center',
      text: 'Режим дисплея',
      fill: '#181818',
      fontFamily: 'Russo One, sans-serif',
      fontSize: 13
    }" />
    <v-line :config="{ points: [190, 390, 220, 390 ], stroke: '#181818' }" />

    <SAMButton :x="20" :y="420" name="SOC" :value="mainRadar.viewMode === ViewModes.MainRadar" label="СОЦ"
      @click="mainRadar.viewMode = ViewModes.MainRadar" />
    <SAMButton :x="90" :y="420" name="BIP" :value="mainRadar.viewMode === ViewModes.BIP" label="БИП"
      @click="mainRadar.viewMode = ViewModes.BIP" />
    <SAMButton :x="160" :y="420" name="LOGS" :value="mainRadar.viewMode === ViewModes.LOGS" label="Логи"
      @click="mainRadar.viewMode = ViewModes.LOGS" />

    <v-rect :config="{
      x: 255,
      y: 360,
      width: 125,
      height: 125,
      fill: 'white',
      stroke: '#181818',
    }" />
    <v-circle ref="clocksRef"  :config="{
      x: 317.5,
      y: 422.5,
      width: 125,
      height: 125,
      stroke: '#181818',
      strokeWidth: 2,
      sceneFunc: drawClock
    }" />

  </v-group>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type Konva from "konva";
import { useSupplyPanelStore } from '@/store/supplyPanel';
import { useMainRadarStore, ViewModes } from '@/store/mainRadarPanel'
import SAMButton from "./SAMButton.vue";
const clocksRef = ref();
const supplyPanel = useSupplyPanelStore();
const mainRadar = useMainRadarStore();

const drawClock = (ctx: CanvasRenderingContext2D, shape: Konva.Shape) => {
  shape.clearCache()
  const d = new Date()
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  const hoursAngle = (hour / 24) * 2 * Math.PI - Math.PI/2
  const minutesAngle = (minutes/60)* 2 * Math.PI - Math.PI/2
  const secondsAngle = (seconds/60)* 2 * Math.PI - Math.PI/2

  const radius = shape.width() / 2 - 8;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, 2 * Math.PI);
  ctx.fill();
  for (let h = 0; h < 12; h++) {
    const angle = ((2 * Math.PI) / 12) * h - Math.PI / 2;
    const outerX = radius * Math.cos(angle);
    const outerY = radius * Math.sin(angle);
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.font = '11px Russo One, sans-serif';
    ctx.fillText((h === 0 ? 12 : h).toString(), outerX, outerY + 4)
  }
  ctx.beginPath();
  ctx.moveTo(0, 0)
  ctx.lineTo(
    30 * Math.cos(hoursAngle),
    30 * Math.sin(hoursAngle),
  )
  ctx.stroke()
  ctx.beginPath();
  ctx.moveTo(0, 0)
  ctx.lineTo(
    40 * Math.cos(minutesAngle),
    40 * Math.sin(minutesAngle),
  )
  ctx.stroke()
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.moveTo(0, 0)
  ctx.lineTo(
    38 * Math.cos(secondsAngle),
    38 * Math.sin(secondsAngle),
  )
  ctx.stroke()
}

onMounted(() => {
  setInterval(() => {
    clocksRef.value.getNode().draw()
  }, 500)
})

</script>