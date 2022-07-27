<template>
  <v-layout full-height>
    <v-main dark>
      <v-tabs v-model="activeScreen">
        <v-tab value="BIP">БИП</v-tab>
        <v-tab value="SOC">СОЦ</v-tab>
        <v-tab value="SNR">СНР</v-tab>
        <v-tab value="Editor">Редактор</v-tab>
      </v-tabs>

      <BIP ref="bipRef" v-show="activeScreen === 'BIP'" />
      <SOC ref="radarRef" v-show="activeScreen === 'SOC'" @exportAzimut="onExportAzimut" />
      <SNR ref="snrRef" v-show="activeScreen === 'SNR'" />
      <Editor v-show="activeScreen === 'Editor'" @addFlightObject="onCreateFlightObject" />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BIP from '@/components/BIP.vue'
import SOC from '@/components/SOC.vue'
import SNR from './components/SNR.vue';
import Editor from '@/components/Editor.vue'
import type FlightObject from './classes/FlightObject';

enum ScreensEnum {
  BIP = 'BIP',
  SOC = 'SOC',
  SNR = 'SNR',
  Editor = 'Editor'
}

const activeScreen = ref(ScreensEnum.Editor);
const setActiveScreen = (v: ScreensEnum) => activeScreen.value = v;

onMounted(() => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const keymap: Record<string, ScreensEnum> = {
      'KeyA': ScreensEnum.BIP,
      'KeyS': ScreensEnum.SOC,
      'KeyD': ScreensEnum.SNR,
      'KeyQ': ScreensEnum.Editor
    }

    if (e.code in keymap) {
      setActiveScreen(keymap[e.code]);
    }
  })

});


const bipRef = ref<InstanceType<typeof BIP> | null>(null);
const radarRef = ref<InstanceType<typeof SOC> | null>(null);
const snrRef = ref<InstanceType<typeof SNR> | null>(null);
function onCreateFlightObject(flightObject: FlightObject) {
  bipRef.value!.addFlightObject(flightObject);
  radarRef.value?.addFlightObject(flightObject);
  snrRef.value?.snr?.addFlightObject(flightObject);
  flightObject.launch(msg => bipRef.value!.bip!.listener(msg))
}

function onExportAzimut(azimut: number) {
  snrRef.value?.snr?.setAzimut(azimut);
}
</script>

<style>
.responsive-canvas {
  display: block;
  max-width: 100%;
  height: calc(100vh - 48px);
}
</style>