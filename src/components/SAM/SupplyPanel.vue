<template>
  <v-group :config="{
    x: 0,
    y: 300,
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
        fill: isPowerEnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="powerOn" :value="isPowerEnabled" @click="isPowerEnabled = true" />
      <SAMButton label="Выкл" :x="300" :y="0" name="powerOff" :value="!isPowerEnabled"
        @click="isPowerEnabled = false" />
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
        name: 'mechanizationIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: isMechanizationEnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="mechanizationOn" :value="isMechanizationEnabled"
        @click="isMechanizationEnabled = true" />
      <SAMButton label="Выкл" :x="300" :y="0" name="mechanizationOff" :value="!isMechanizationEnabled"
        @click="isMechanizationEnabled = false" />
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
        name: 'socIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: isSOCEnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="socOn" :value="isSOCEnabled" @click="isSOCEnabled = true" />
      <SAMButton label="Выкл" :x="300" :y="0" name="socOff" :value="!isSOCEnabled" @click="isSOCEnabled = false" />
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
        name: 'snrIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: isSNREnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="snrOn" :value="isSNREnabled" @click="isSNREnabled = true" />
      <SAMButton label="Выкл" :x="300" :y="0" name="snrOff" :value="!isSNREnabled" @click="isSNREnabled = false" />
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
        name: 'olsIndicator',
        x: 180,
        y: 30,
        width: 20,
        height: 20,
        fill: isOLSEnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="Вкл" :x="235" :y="0" name="olsOn" :value="isOLSEnabled" @click="isOLSEnabled = true" />
      <SAMButton label="Выкл" :x="300" :y="0" name="olsOff" :value="!isOLSEnabled" @click="isOLSEnabled = false" />
    </v-group>

    <v-line :config="{ points: [20, 390, 50, 390 ], stroke: '#181818' }"/>
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
    <v-line :config="{ points: [190, 390, 220, 390 ], stroke: '#181818' }"/>

    <SAMButton :x="20" :y="420" name="SOC" :value="viewMode === 'SOC'" label="СОЦ" @click="viewMode = 'SOC'"/>
    <SAMButton :x="90" :y="420" name="BIP" :value="viewMode === 'BIP'" label="БИП" @click="viewMode = 'BIP'"/>
    <SAMButton :x="160" :y="420" name="LOGS" :value="viewMode === 'LOGS'" label="Логи" @click="viewMode = 'LOGS'"/>

    <v-rect :config="{
      x: 255,
      y: 360,
      width: 125,
      height: 125,
      fill: 'white',
      stroke: '#181818',
    }" />
    <v-circle :config="{
      x: 317.5,
      y: 422.5,
      width: 125,
      height: 125,
      stroke: '#181818',
      
      sceneFunc: drawClock
    }" />

  </v-group>
</template>

<script setup lang="ts">
import type Konva from "konva";
import { ref } from "vue";
import SAMButton from "./SAMButton.vue";
const isPowerEnabled = ref(false)
const isMechanizationEnabled = ref(false)
const isSOCEnabled = ref(false);
const isSNREnabled = ref(false);
const isOLSEnabled = ref(false);
const viewMode = ref('SOC')

const drawClock = (ctx: CanvasRenderingContext2D, shape: Konva.Shape) => {
  const d = new Date()
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

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
}
</script>