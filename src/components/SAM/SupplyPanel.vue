<template>
  <v-group :config="{
    x: 0,
    y: 0,
  }">
    <v-rect :config="{
      x: 0,
      y: 0,
      width: 800,
      height: 150,
      fill: 'grey', shadowBlur: 10, cornerRadius: 6,
    }" />
    <!-- Power -->
    <v-group :config="{ x: 20, y: 20 }">
      <v-text :config="{
        x: 0,
        y: 10,
        height: 20,
        verticalAlign: 'middle',
        text: 'Питание',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12
      }" />
      <v-circle :config="{
        name: 'powerIndicator',
        x: 95,
        y: 20,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledPower ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="0" :y="50" name="powerOn" :value="supplyPanel.isEnabledPower"
        @click="supplyPanel.setEnabledPower(true)" />
      <SAMButton label="Выкл" :x="65" :y="50" name="powerOff" :value="!supplyPanel.isEnabledPower"
        @click="supplyPanel.setEnabledPower(false)" />
    </v-group>

    <!-- SOC mechanization -->
    <v-group :config="{ x: 160, y: 20 }">
      <v-text :config="{
        x: 0,
        y: 10,
        height: 20,
        verticalAlign: 'middle',
        text: 'Поиск',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12
      }" />
      <v-circle :config="{
        name: 'rotationIndicator',
        x: 95,
        y: 20,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledMainRadar ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="0" :y="50" name="rotationOn" :value="supplyPanel.isEnabledMainRadar"
        @click="supplyPanel.setEnablerMainRadar(true)" />
      <SAMButton label="Выкл" :x="65" :y="50" name="rotationOff" :value="!supplyPanel.isEnabledMainRadar"
        @click="supplyPanel.setEnablerMainRadar(false)" />
    </v-group>

    <!-- SNR antenna -->
    <v-group :config="{ x: 300, y: 20 }">
      <v-text :config="{
        x: 0,
        y: 10,
        height: 20,
        verticalAlign: 'middle',
        text: 'Передатчик',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12
      }" />
      <v-circle :config="{
        name: 'targetRadarIndicator',
        x: 95,
        y: 20,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledTargetRadarTransmitter ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="0" :y="50" name="snrOn" :value="supplyPanel.isEnabledTargetRadarTransmitter"
        @click="supplyPanel.setIsEnabledTargetRadarTransmitter(true)" />
      <SAMButton label="Выкл" :x="65" :y="50" name="snrOff" :value="!supplyPanel.isEnabledTargetRadarTransmitter"
        @click="supplyPanel.setIsEnabledTargetRadarTransmitter(false)" />
    </v-group>
    <!-- OLS power -->
    <v-group :config="{ x: 440, y: 20 }">
      <v-text :config="{
        x: 0,
        y: 10,
        height: 20,
        verticalAlign: 'middle',
        text: 'Тепловизор',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12
      }" />
      <v-circle :config="{
        name: 'thermalCameraIndicator',
        x: 95,
        y: 20,
        width: 20,
        height: 20,
        fill: supplyPanel.isEnabledThermalCamera ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="0" :y="50" name="thermalCameraOn" :value="supplyPanel.isEnabledThermalCamera"
        @click="supplyPanel.setIsEnabledThermalCamera(true)" />
      <SAMButton label="Выкл" :x="65" :y="50" name="thermalCameraOff" :value="!supplyPanel.isEnabledThermalCamera"
        @click="supplyPanel.setIsEnabledThermalCamera(false)" />
    </v-group>

    <v-rect :config="{
      x: 670,
      y: 20,
      width: 110,
      height: 110,
      fill: 'white',
      stroke: '#181818',
    }" />
    <v-circle ref="clocksRef"  :config="{
      x: 725,
      y: 75,
      width: 110,
      height: 110,
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
import SAMButton from "./SAMButton.vue";
const clocksRef = ref();
const supplyPanel = useSupplyPanelStore();

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