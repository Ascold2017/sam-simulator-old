<template>
  <v-container fluid class="px-6">
    <!-- TOP PANEL -->
    <v-card class="mb-6 py-3 px-3 mx-auto" max-width="1900">
      <v-row>
        <v-col cols="4" class="d-flex">
          <div>
            <div class="mb-3">
              <span class="v-label" style="width: 70px">Питание</span>
              <v-icon :color="params.isEnabled ? 'success' : 'warning'" class="mx-3">mdi-checkbox-blank-circle</v-icon>
              <v-btn-toggle density="compact" :model-value="params.isEnabled" @update:model-value="setIsEnabled" divided
                mandatory variant="outlined">
                <v-btn size="x-small" :value="true">Вкл</v-btn>
                <v-btn size="x-small" :value="false">Выкл</v-btn>
              </v-btn-toggle>
            </div>
            <div class="mb-3">
              <span class="v-label" style="width: 70px">COЦ</span>
              <v-icon :color="params.isEnabledSOC ? 'success' : 'warning'" class="mx-3">mdi-checkbox-blank-circle
              </v-icon>
              <v-btn-toggle density="compact" :disabled="!params.isEnabled" mandatory :model-value="params.isEnabledSOC"
                @update:model-value="setIsEnabledSOC" divided variant="outlined">
                <v-btn size="x-small" :value="true">Вкл</v-btn>
                <v-btn size="x-small" :value="false">Выкл</v-btn>
              </v-btn-toggle>
            </div>
            <div>
              <span class="v-label" style="width: 70px">CНР</span>
              <v-icon :color="params.isEnabledSNR ? 'success' : 'warning'" class="mx-3">mdi-checkbox-blank-circle
              </v-icon>
              <v-btn-toggle density="compact" :disabled="!params.isEnabled" mandatory :model-value="params.isEnabledSNR"
                @update:model-value="setIsEnabledSNR" divided variant="outlined">
                <v-btn size="x-small" :value="true">Вкл</v-btn>
                <v-btn size="x-small" :value="false">Выкл</v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <v-divider vertical class="mx-6" />
          <v-radio-group label="Режим антенны" :model-value="rayWidth" @update:model-value="setRayWidth" hide-details
            class="flex-grow-0">
            <v-radio :value="16" label="Широкий луч"></v-radio>
            <v-radio :value="3" label="Узкий луч"></v-radio>
            <v-radio :value="1.5" label="Подсвет"></v-radio>
          </v-radio-group>

        </v-col>
        <v-col cols="4" class="border" style="border-top: 0!important; border-bottom: 0!important;">
          <canvas ref="targetParamsRef" width="600" height="120" class="mt-6"
            style="display: block; max-width: 100%"></canvas>
        </v-col>
        <v-col cols="4" class="d-flex">
          <v-radio-group label="Режим дальности СНР" :model-value="distanceScale" @update:model-value="setDistanceScale"
            hide-details class="flex-grow-0">
            <v-radio :value="1" label="100 km"></v-radio>
            <v-radio :value="0.5" label="50 km"></v-radio>
            <v-radio :value="0.3" label="30 km"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card>
    <!-- MIDDLE PANEL -->
    <div class="mb-6  mx-auto " max-width="1900">
      <v-row>

        <!-- TARGET INDICATOR -->
        <v-col cols="4" style="position: relative">
          <v-card class="py-3 px-3">
            <canvas ref="targetScreenRef" width="600" height="600" class="border mx-auto"
              style="display: block; max-width: 100%"></canvas>
          </v-card>
        </v-col>
        <!-- SOC INDICATOR -->
        <v-col cols="4" style="position: relative;">
          <v-card class="py-3 px-3">
            <div class="d-flex align-center" style="position: absolute; top: 15px; left: 15px; z-index: 1;"
              @click.right.prevent="resetCaptureTargetByDirection">
              <v-icon :color="params.isCapturedByDirection ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
              <span class="px-3">AC-1</span>
            </div>
            <canvas ref="radarRef" width=650 height=650 class="mx-auto"
              style="display: block; max-width: 100%;"></canvas>
            <div class="d-flex align-center" style="position: absolute; top: 15px; right: 15px; z-index: 1;"
              @click.right.prevent="resetCaptureTargetByDistance">
              <span class="px-3">AC-2</span>
              <v-icon :color="params.isCapturedByDistance ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
            </div>
          </v-card>
        </v-col>
        <!-- DISTANCE INDICATOR -->
        <v-col cols="4" class="d-flex flex-column">
          <v-card class="px-3 py-3 mb-3">
            <canvas ref="distanceScreenRef" width="600" height="275" class="border mx-auto"
              style="display: block; max-width: 100%"></canvas>

          </v-card>

          <v-card class="px-3 py-3 d-flex align-center flex-nowrap">
            <div class="mx-3" v-for="missile in missiles">
              <div class="text-center">{{ missile.id + 1 }}</div>
              <v-icon :color="missile.isLaunched || !params.isEnabled ? 'warning' : 'success'">
                mdi-checkbox-blank-circle</v-icon>
            </div>

            <v-divider vertical class="ml-3 mr-6" />
            <v-btn color="error" @click="launchMissile">Пуск
            </v-btn>
          </v-card>


        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import SAMissile from '@/classes/SAMissile';

import SAM from '@/classes/SAM';
import SOCScreen from '@/classes/SOCScreen.js';
import SNRTargetScreen from '@/classes/SNRTargetScreen';
import SNRDistanceScreen from '@/classes/SNRDistanceScreen'
import SNRTargetParamsScreen from '@/classes/SNRTargetParamsScreen';
import { onMounted, ref, reactive, computed } from 'vue';
import type FlightObject from '@/classes/FlightObject';
import Sounds from '@/classes/Sounds.js';
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
const sam = ref<SAM | null>(null);
const socScreen = ref<SOCScreen | null>(null);
const snrDistanceScreen = ref<SNRDistanceScreen | null>(null);
const snrTargetScreen = ref<SNRTargetScreen | null>(null);
const snrTargetParamsScreen = ref<SNRTargetParamsScreen | null>(null);

const params = reactive<Record<string, boolean | number>>({
  isCapturedByDirection: false,
  isCapturedByDistance: false,
  isEnabled: false,
  isEnabledSOC: false,
  isEnabledSNR: false
})

const missiles = ref<IMissileParams[]>(Array(6).fill(0).map((_, i) => ({ id: i, isLaunched: false, velocity: 900, maxDistance: 25, initialPoint: { x: 0, y: 0, z: 0.03 } })))

let rayWidth = computed(() => sam.value?.radarRayWidth)
let distanceScale = computed(() => sam.value?.distanceScale);

const setRayWidth = (v: number) => sam.value!.setRadarRayWidth(v);
const resetCaptureTargetByDirection = () => sam.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => sam.value?.resetCaptureTargetByDistance();
const setDistanceScale = (v: number) => {
  sam.value?.setDistanceScale(v);
}

const setIsEnabled = (value: boolean) => sam.value?.setIsEnabled(value)
const setIsEnabledSNR = (value: boolean) => sam.value?.setIsEnabledSNR(value)

const setIsEnabledSOC = (value: boolean) => sam.value?.setIsEnabledSOC(value)


function SNRListener(property: string, value: number | boolean) {
  property === 'isCapturedByDirection' && (params.isCapturedByDirection = value)
  property === 'isCapturedByDistance' && (params.isCapturedByDistance = value)
  property === 'isEnabled' && (params.isEnabled = value)
  property === 'isEnabledSNR' && (params.isEnabledSNR = value)
  property === 'isEnabledSOC' && (params.isEnabledSOC = value)
  property === 'targetHeight' && snrTargetParamsScreen.value?.setParam('targetHeight', value as number)
  property === 'targetVelocity' && snrTargetParamsScreen.value?.setParam('targetVelocity', value as number)
  property === 'targetParam' && snrTargetParamsScreen.value?.setParam('targetParam', value as number)
}

function launchMissile() {
  const missileParams = missiles.value.find(m => !m.isLaunched);
  if (!missileParams) return;
  if (sam.value!.trackedTarget) {
    const missile = new SAMissile(sam.value!.trackedTarget as FlightObject, missileParams.maxDistance, missileParams.velocity, missileParams.initialPoint)
    missile.launch();
    missiles.value = missiles.value.map(m => m.id === missileParams.id ? { ...m, isLaunched: true } : m)
    sam.value!.addMissile(missile);
    Sounds.click();
  }
}

function addFlightObject(flightObject: FlightObject) {
  sam.value?.addFlightObject(flightObject);
}

onMounted(() => {
  socScreen.value = new SOCScreen({
    scale: initialParams.initialScale,
    canvasRadar: radarRef.value!,
    rayWidth: 8
  });
  snrTargetScreen.value = new SNRTargetScreen(targetScreenRef.value!);
  snrDistanceScreen.value = new SNRDistanceScreen(distanceScreenRef.value!, initialParams.maxDistance, initialParams.distanceDetectRange, initialParams.initialDistance, initialParams.missileMaxDistance);
  snrTargetParamsScreen.value = new SNRTargetParamsScreen({ indicatorsCanvas: targetParamsRef.value!, maxHeight: 15, maxVelocity: 900, killZoneDistance: initialParams.missileMaxDistance });
  sam.value = new SAM({
    snrTargetScreen: snrTargetScreen.value! as SNRTargetScreen,
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
          sam.value?.setAzimut(sam.value.azimutDeg - 0.5)
        } else {
          sam.value?.setAzimut(sam.value.azimutDeg - 0.05)
        }
      },
      'KeyD': () => {
        if (event.shiftKey) {
          sam.value?.setAzimut(sam.value.azimutDeg + 0.5)
        } else {
          sam.value?.setAzimut(sam.value.azimutDeg + 0.05)
        }
      },
      'KeyW': () => sam.value?.setVerticalAngle(sam.value.verticalAngleDeg + 0.05),
      'KeyS': () => sam.value?.setVerticalAngle(sam.value.verticalAngleDeg - 0.05),
      'Space': () => {
        sam.value?.captureTargetByDirection()
        sam.value?.captureTargetByDistance()
      },
      'KeyQ': () => sam.value?.setIndicatorTargetDistance(sam.value.indicatorTargetDistance - 0.2),
      'KeyE': () => sam.value?.setIndicatorTargetDistance(sam.value.indicatorTargetDistance + 0.2),
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  addFlightObject
})
</script>