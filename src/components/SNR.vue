<template>
  <v-container fluid class="px-6">
    <v-card class="mb-6 py-1 px-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4"></v-col>
        <v-col cols="4" class="border">
          <v-radio-group inline hide-details :model-value="scale" @update:model-value="setScale"
            label="Режим дальности СОЦ">
            <v-radio label="150 km" :value="2" />
            <v-radio label="100 km" :value="3" />
            <v-radio label="50 km" :value="6" />
          </v-radio-group>
        </v-col>
        <v-col cols="4">
          <v-radio-group inline label="Режим дальности СНР" :model-value="distanceScreenScale"
            @update:model-value="setDistanceScreenScale" hide-details class="flex-grow-0 mt-2">
            <v-radio :value="1" label="100 km"></v-radio>
            <v-radio :value="0.5" label="50 km"></v-radio>
            <v-radio :value="0.3" label="30 km"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card>
    <v-card class="mb-6 py-3 px-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4" style="position: relative">
          <canvas ref="targetScreenRef" width="600" height="600" class="border mx-auto"
            style="display: block; max-width: 100%; background-color: black"></canvas>
          <div class="d-flex align-center" style="position: absolute; top: 15px; right: 15px; z-index: 1;"
            @click.right.prevent="resetCaptureTargetByDirection">
            <span class="px-3">AC-1</span>
            <v-icon :color="params.isCapturedByDirection ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>

          </div>
        </v-col>
        <v-col cols="4" style="position: relative;">
          <canvas ref="radarRef" width=650 height=650 class="border mx-auto"
            style="display: block; max-width: 100%; background-color: black"></canvas>
          <v-btn color="red" icon @click="exportAzimut" style="position: absolute; right: 20px; top: 20px;">ЦУ
          </v-btn>
        </v-col>
        <v-col cols="4">
          <div style="position: relative" class="mb-3">
            <canvas ref="distanceScreenRef" width="600" height="275" class="border mx-auto"
              style="display: block; max-width: 100%; background-color: black"></canvas>
            <div class="d-flex align-center" style="position: absolute; bottom: 15px; right: 15px; z-index: 1;"
              @click.right.prevent="resetCaptureTargetByDistance">
              <span class="px-3">AC-2</span>
              <v-icon :color="params.isCapturedByDistance ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
            </div>
          </div>
          <v-divider />

        </v-col>
      </v-row>
    </v-card>
    <v-card class="px-3 py-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4" class="d-flex">
          <canvas ref="snrIndicatorsRef" width="400" height="200" class="mr-3"></canvas>
          <v-radio-group label="Режим антенны" :model-value="rayWidth" @update:model-value="setRayWidth" hide-details
            class="flex-grow-0">
            <v-radio :value="16" label="Широкий луч"></v-radio>
            <v-radio :value="3" label="Узкий луч"></v-radio>
            <v-radio :value="1.5" label="Подсвет"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="4" class="border" style="border-top: 0!important; border-bottom: 0!important;">
          <div class="d-flex flex-column">

            <canvas ref="targetParamsRef" width="600" height="120" style="background-color: black"></canvas>
          </div>
        </v-col>
        <v-col cols="4">
          <v-btn color="error" @click="launchMissile"
            :disabled="!(params.isCapturedByDirection && params.isCapturedByDistance)">Пуск</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import SAMissile from '@/classes/SAMissile';
import SOC from '@/classes/SOC.js';
import SNR from '@/classes/SNR';
import SNRTargetScreen from '@/classes/SNRTargetScreen';
import SNRIndicatorsScreen from '@/classes/SNRIndicatorsScreen';
import SNRDistanceScreen from '@/classes/SNRDistanceScreen'
import SNRTargetParamsScreen from '@/classes/SNRTargetParamsScreen';
import { onMounted, ref, reactive, computed } from 'vue';
import type FlightObject from '@/classes/FlightObject';

const initialParams = {
  initialDistance: 30,
  maxDistance: 100,
  minVerticalAngle: -5,
  maxVerticalAngle: 75,
  missileVelocity: 900,
  missileMaxDistance: 25,
  distanceDetectRange: 0.5,
  initialRayWidth: 16,
}

const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const distanceScreenRef = ref<HTMLCanvasElement | null>(null);
const radarRef = ref<HTMLCanvasElement | null>(null);
const snrIndicatorsRef = ref<HTMLCanvasElement | null>(null);
const targetParamsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);
const radar = ref<SOC | null>(null);
const snrDistanceScreen = ref<SNRDistanceScreen | null>(null);
const snrTargetParamsScreen = ref<SNRTargetParamsScreen | null>(null);

const params = reactive<Record<string, boolean | number>>({
  isCapturedByDirection: false,
  isCapturedByDistance: false,
})

let rayWidth = computed(() => snr.value?.radarRayWidth)
let distanceScreenScale = computed(() => snrDistanceScreen.value?.screenScale);
const scale = computed(() => radar.value?.scale);

const setTargetRayAngle = (v: number) => radar.value!.targetRayAngle = v;
const setScale = (v: number) => radar.value!.scale = v;
const setRayWidth = (v: number) => snr.value!.setRadarRayWidth(v);
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => snr.value?.resetCaptureTargetByDistance();
const setDistanceScreenScale = (v: number) => {
  snrDistanceScreen.value?.setScale(v);
}
const exportAzimut = () => snr.value?.setAzimut(radar.value!.targetRayAngle)

function SNRListener(property: string, value: number | boolean) {
  property === 'isCapturedByDirection' && (params.isCapturedByDirection = value)
  property === 'isCapturedByDistance' && (params.isCapturedByDistance = value)
  property === 'targetHeight' && snrTargetParamsScreen.value?.setParam('targetHeight', value as number)
  property === 'targetVelocity' && snrTargetParamsScreen.value?.setParam('targetVelocity', value as number)
  property === 'targetParam' && snrTargetParamsScreen.value?.setParam('targetParam', value as number)
}

function launchMissile() {
  if (snr.value!.trackedTarget) {
    const missile = new SAMissile(snr.value!.trackedTarget as FlightObject, 25, 900, { x: 0, y: 0, z: 0.03 })
    missile.launch();
    snr.value!.addMissile(missile);
  }
}

function addFlightObject(flightObject: FlightObject) {
  snr.value?.addFlightObject(flightObject);
  radar.value?.addFlightObject(flightObject);
}

onMounted(() => {
  radar.value = new SOC({
    scale: scale.value,
    canvasRadar: radarRef.value,
    rayWidth: 8
  });
  const snrTargetScreen = new SNRTargetScreen(targetScreenRef.value!);
  snrDistanceScreen.value = new SNRDistanceScreen(distanceScreenRef.value!, initialParams.maxDistance, initialParams.distanceDetectRange, initialParams.initialDistance, initialParams.missileMaxDistance);
  const snrIndicatorsScreen = new SNRIndicatorsScreen(snrIndicatorsRef.value!, initialParams.minVerticalAngle, initialParams.maxVerticalAngle)
  snrTargetParamsScreen.value = new SNRTargetParamsScreen({ indicatorsCanvas: targetParamsRef.value!, maxHeight: 15, maxVelocity: 900, killZoneDistance: initialParams.missileMaxDistance });
  snr.value = new SNR({
    snrTargetScreen,
    snrIndicatorsScreen,
    snrDistanceScreen: snrDistanceScreen.value! as SNRDistanceScreen,
    eventListener: SNRListener,
    distanceDetectRange: initialParams.distanceDetectRange,
    initialDistance: initialParams.initialDistance,
    initialRayWidth: initialParams.initialRayWidth,
    maxDistance: initialParams.maxDistance,
    missileVelocity: initialParams.missileVelocity,
    missileMaxDistance: initialParams.missileMaxDistance
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      'KeyA': () => event.shiftKey ? setTargetRayAngle(radar.value!.targetRayAngle - 0.5) : snr.value?.setAzimut(snr.value.azimutDeg - 0.05),
      'KeyD': () => event.shiftKey ? setTargetRayAngle(radar.value!.targetRayAngle + 0.5) : snr.value?.setAzimut(snr.value.azimutDeg + 0.05),
      'KeyW': () => snr.value?.setVerticalAngle(snr.value.verticalAngleDeg + 0.05),
      'KeyS': () => snr.value?.setVerticalAngle(snr.value.verticalAngleDeg - 0.05),
      'Space': () => {
        snr.value?.captureTargetByDirection()
        snr.value?.captureTargetByDistance()
      },
      'KeyQ': () => snr.value?.setIndicatorTargetDistance(snr.value.indicatorTargetDistance - 0.2),
      'KeyE': () => snr.value?.setIndicatorTargetDistance(snr.value.indicatorTargetDistance + 0.2),
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  addFlightObject
})
</script>