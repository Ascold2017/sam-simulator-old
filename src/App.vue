<template>
  <v-layout full-height>
    <v-main dark>
      <div class="d-flex justify-center py-3">
        <v-btn-toggle v-model="activeScreen">
          <v-btn value="BIP">БИП</v-btn>
          <v-btn value="SOC">СОЦ</v-btn>
          <v-btn value="SNR">СНР</v-btn>
          <v-btn value="Editor">Редактор</v-btn>
        </v-btn-toggle>
      </div>
      <BIP ref="bipRef" v-show="activeScreen === 'BIP'" />
      <SOC ref="radarRef" v-show="activeScreen === 'SOC'" @exportAzimut="onExportAzimut" />
      <SNR ref="snrRef" v-show="activeScreen === 'SNR'" />
      <Editor v-show="activeScreen === 'Editor'" @addFlightObject="onCreateFlightObject" />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BIP from '@/components/BIP.vue'
import SOC from '@/components/SOC.vue'
import SNR from '@/components/SNR.vue';
import Editor from '@/components/Editor.vue'
import type FlightObject from './classes/FlightObject';

enum ScreensEnum {
  BIP = 'BIP',
  SOC = 'SOC',
  SNR = 'SNR',
  Editor = 'Editor'
}

const activeScreen = ref(ScreensEnum.Editor);

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

