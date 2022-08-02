<template>
  <v-container fluid class="px-6">
    <!-- TOP PANEL -->
    <v-card class="mb-6 py-3 px-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4" class="d-flex">
          <div>
            <div class="mb-2">
              <span class="v-label">Питание</span>
              <v-icon :color="'warning'" class="mx-3">mdi-checkbox-blank-circle</v-icon>
            </div>
            <v-btn-toggle divided variant="outlined">
              <v-btn>Вкл</v-btn>
              <v-btn>Выкл</v-btn>
            </v-btn-toggle>
          </div>
          <v-divider vertical class="mx-3" />
          <div>
            <div class="mb-2">
              <span class="v-label">COЦ</span>
              <v-icon :color="'warning'" class="mx-3">mdi-checkbox-blank-circle</v-icon>
            </div>
            <v-btn-toggle divided variant="outlined">
              <v-btn>Вкл</v-btn>
              <v-btn>Выкл</v-btn>
            </v-btn-toggle>
          </div>
          <v-divider vertical class="mx-3" />
          <div>
            <div class="mb-2">
              <span class="v-label">CНР</span>
              <v-icon :color="'warning'" class="mx-3">mdi-checkbox-blank-circle</v-icon>
            </div>
            <v-btn-toggle divided variant="outlined">
              <v-btn>Вкл</v-btn>
              <v-btn>Выкл</v-btn>
            </v-btn-toggle>
          </div>

        </v-col>
        <v-col cols="4" class="border" style="border-top: 0!important; border-bottom: 0!important;">
        </v-col>
        <v-col cols="4">
          <v-radio-group inline label="Режим дальности СНР" :model-value="distanceScale"
            @update:model-value="setDistanceScale" hide-details class="flex-grow-0 mt-2">
            <v-radio :value="1" label="100 km"></v-radio>
            <v-radio :value="0.5" label="50 km"></v-radio>
            <v-radio :value="0.3" label="30 km"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card>
    <!-- MIDDLE PANEL -->
    <v-card class="mb-6 py-3 px-3 mx-auto" max-width="1900">
      <v-row>
        <!-- TARGET INDICATOR -->
        <v-col cols="4" style="position: relative">
          <canvas ref="targetScreenRef" width="600" height="600" class="border mx-auto"
            style="display: block; max-width: 100%; background-color: black"></canvas>

        </v-col>
        <!-- SOC INDICATOR -->
        <v-col cols="4" style="position: relative;">
          <div class="d-flex align-center" style="position: absolute; top: 15px; left: 15px; z-index: 1;"
            @click.right.prevent="resetCaptureTargetByDirection">
            <v-icon :color="params.isCapturedByDirection ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
            <span class="px-3">AC-1</span>
          </div>
          <canvas ref="radarRef" width=650 height=650 class="border mx-auto"
            style="display: block; max-width: 100%; background-color: black"></canvas>
          <div class="d-flex align-center" style="position: absolute; top: 15px; right: 15px; z-index: 1;"
            @click.right.prevent="resetCaptureTargetByDistance">
            <span class="px-3">AC-2</span>
            <v-icon :color="params.isCapturedByDistance ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
          </div>
        </v-col>
        <!-- DISTANCE INDICATOR -->
        <v-col cols="4">
          <div class="mb-3">
            <canvas ref="distanceScreenRef" width="600" height="275" class="border mx-auto"
              style="display: block; max-width: 100%; background-color: black"></canvas>

          </div>
          <v-divider class="mb-3" />
          <v-radio-group inline label="Режим антенны" :model-value="rayWidth" @update:model-value="setRayWidth"
            hide-details class="flex-grow-0">
            <v-radio :value="16" label="Широкий луч"></v-radio>
            <v-radio :value="3" label="Узкий луч"></v-radio>
            <v-radio :value="1.5" label="Подсвет"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card>
    <!-- BOTTOM PANEL -->
    <v-card class="px-3 py-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4" class="d-flex">

        </v-col>
        <v-col cols="4" class="border" style="border-top: 0!important; border-bottom: 0!important;">
          <v-row class="h-100">
            <v-col cols="2" v-for="missile in missiles"
              class="h-100 d-flex flex-column align-center justify-space-between">
              <v-icon :color="missile.isLaunched ? 'warning' : 'success'">mdi-checkbox-blank-circle</v-icon>
              <span>{{ missile.id + 1 }}</span>
              <v-btn color="error" size="small" @click="launchMissile(missile)"
                :disabled="!(params.isCapturedByDirection && params.isCapturedByDistance) || missile.isLaunched" icon>
              </v-btn>
              <span>Пуск</span>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="4">
          <canvas ref="targetParamsRef" width="600" height="120" style="display: block; max-width: 100%"></canvas>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import SAMissile from '@/classes/SAMissile';

import SNR from '@/classes/SNR';
import SOCScreen from '@/classes/SOCScreen.js';
import SNRTargetScreen from '@/classes/SNRTargetScreen';
import SNRDistanceScreen from '@/classes/SNRDistanceScreen'
import SNRTargetParamsScreen from '@/classes/SNRTargetParamsScreen';
import { onMounted, ref, reactive, computed } from 'vue';
import type FlightObject from '@/classes/FlightObject';
interface IMissileParams {
  id: number;
  isLaunched: boolean;
  velocity: number;
  maxDistance: number;
  initialPoint: { x: number; y: number; z: number; }
}
const initialParams = {
  initialScale: 1,
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
const targetParamsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);
const socScreen = ref<SOCScreen | null>(null);
const snrDistanceScreen = ref<SNRDistanceScreen | null>(null);
const snrTargetParamsScreen = ref<SNRTargetParamsScreen | null>(null);

const params = reactive<Record<string, boolean | number>>({
  isCapturedByDirection: false,
  isCapturedByDistance: false,
})

const missiles = ref<IMissileParams[]>(Array(6).fill(0).map((_, i) => ({ id: i, isLaunched: false, velocity: 900, maxDistance: 25, initialPoint: { x: 0, y: 0, z: 0.03 } })))

let rayWidth = computed(() => snr.value?.radarRayWidth)
let distanceScale = computed(() => snr.value?.distanceScale);

const setRayWidth = (v: number) => snr.value!.setRadarRayWidth(v);
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => snr.value?.resetCaptureTargetByDistance();
const setDistanceScale = (v: number) => {
  snr.value?.setDistanceScale(v);
}

function SNRListener(property: string, value: number | boolean) {
  property === 'isCapturedByDirection' && (params.isCapturedByDirection = value)
  property === 'isCapturedByDistance' && (params.isCapturedByDistance = value)
  property === 'targetHeight' && snrTargetParamsScreen.value?.setParam('targetHeight', value as number)
  property === 'targetVelocity' && snrTargetParamsScreen.value?.setParam('targetVelocity', value as number)
  property === 'targetParam' && snrTargetParamsScreen.value?.setParam('targetParam', value as number)
}

function launchMissile(missileParams: IMissileParams) {
  if (snr.value!.trackedTarget) {
    const missile = new SAMissile(snr.value!.trackedTarget as FlightObject, missileParams.maxDistance, missileParams.velocity, missileParams.initialPoint)
    missile.launch();
    missiles.value = missiles.value.map(m => m.id === missileParams.id ? { ...m, isLaunched: true } : m)
    snr.value!.addMissile(missile);
  }
}

function addFlightObject(flightObject: FlightObject) {
  snr.value?.addFlightObject(flightObject);
}

onMounted(() => {
  socScreen.value = new SOCScreen({
    scale: initialParams.initialScale,
    canvasRadar: radarRef.value!,
    rayWidth: 8
  });
  const snrTargetScreen = new SNRTargetScreen(targetScreenRef.value!);
  snrDistanceScreen.value = new SNRDistanceScreen(distanceScreenRef.value!, initialParams.maxDistance, initialParams.distanceDetectRange, initialParams.initialDistance, initialParams.missileMaxDistance);
  snrTargetParamsScreen.value = new SNRTargetParamsScreen({ indicatorsCanvas: targetParamsRef.value!, maxHeight: 15, maxVelocity: 900, killZoneDistance: initialParams.missileMaxDistance });
  snr.value = new SNR({
    snrTargetScreen,
    snrDistanceScreen: snrDistanceScreen.value! as SNRDistanceScreen,
    socScreen: socScreen.value! as SOCScreen,
    eventListener: SNRListener,
    distanceDetectRange: initialParams.distanceDetectRange,
    initialDistance: initialParams.initialDistance,
    initialRayWidth: initialParams.initialRayWidth,
    maxDistance: initialParams.maxDistance,
    missileVelocity: initialParams.missileVelocity,
    missileMaxDistance: initialParams.missileMaxDistance,
    minVerticalAngle: initialParams.minVerticalAngle,
    maxVerticalAngle: initialParams.maxVerticalAngle
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      'KeyA': () => {
        if (event.shiftKey) {
          snr.value?.setAzimut(snr.value.azimutDeg - 0.5)
        } else {
          snr.value?.setAzimut(snr.value.azimutDeg - 0.05)
        }
      },
      'KeyD': () => {
        if (event.shiftKey) {
          snr.value?.setAzimut(snr.value.azimutDeg + 0.5)
        } else {
          snr.value?.setAzimut(snr.value.azimutDeg + 0.05)
        }
      },
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