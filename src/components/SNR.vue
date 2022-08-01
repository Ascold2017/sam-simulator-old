<template>
  <div class="px-6">
    <div class="d-flex justify-center">
      <v-card>
        <canvas ref="targetScreenRef" width="600" height="600" class="border"></canvas>
      </v-card>
      <v-card class="flex-1 mx-3 px-3 py-3 d-flex flex-column">
        <canvas ref="snrIndicatorsRef" width="400" height="200"></canvas>
        <v-divider class="mt-2" />
        <div class="d-flex flex-column flex-grow-1 mt-3">

          <v-radio-group inline label="Режим антенны" :model-value="rayWidth" @update:model-value="setRayWidth"
            hide-details class="flex-grow-0">
            <v-radio :value="20" label="Широкий луч (20*)"></v-radio>
            <v-radio :value="4" label="Узкий луч (4*)"></v-radio>
            <v-radio :value="1.7" label="Подсвет (1.7*)"></v-radio>
          </v-radio-group>
          <v-divider />
          <v-radio-group inline label="Масштаб" :model-value="distanceScreenScale"
            @update:model-value="setDistanceScreenScale" hide-details class="flex-grow-0 mt-2">
            <v-radio :value="1" label="150 km"></v-radio>
            <v-radio :value="0.5" label="75 km"></v-radio>
            <v-radio :value="0.3" label="45 km"></v-radio>
          </v-radio-group>
          <div class="mb-3">
            <p>Д, km: {{ params.targetDistance }}</p>
            <p>V, m/s: {{ params.targetVelocity }}</p>
            <p>H, m: {{ params.targetHeight }}</p>
            <p>P, km: {{ params.targetParam }}</p>
          </div>
          <v-btn color="error" block @click="launchMissile"
            :disabled="!(params.isCapturedByDirection && params.isCapturedByDistance)">Пуск</v-btn>

          <v-divider class="mt-auto" />
          <div class="d-flex justify-space-between mt-3">
            <v-icon :color="params.isCapturedByDirection ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
            <span class="pr-3">AC-1</span>
            <v-btn small color="warning" class="mr-3" :disabled="!params.isCapturedByDirection"
              @click="resetCaptureTargetByDirection">Сброс</v-btn>
            <v-divider vertical />
            <v-btn small color="warning" class="ml-3" :disabled="!params.isCapturedByDistance"
              @click="resetCaptureTargetByDistance">Сброс</v-btn>
            <span class="pl-3">AC-2</span>
            <v-icon :color="params.isCapturedByDistance ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
          </div>
        </div>
      </v-card>
      <v-card>
        <canvas ref="distanceScreenRef" width="400" height="600" class="border"></canvas>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import SAMissile from '@/classes/SAMissile';
import SNR from '@/classes/SNR';
import SNRTargetScreen from '@/classes/SNRTargetScreen';
import SNRIndicatorsScreen from '@/classes/SNRIndicatorsScreen';
import SNRDistanceScreen from '@/classes/SNRDistanceScreen'
import { onMounted, ref, reactive, computed } from 'vue';
import type FlightObject from '@/classes/FlightObject';
const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const distanceScreenRef = ref<HTMLCanvasElement | null>(null);
const snrIndicatorsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);
const snrDistanceScreen = ref<SNRDistanceScreen | null>(null);

const params = reactive<Record<string, boolean | number>>({
  isCapturedByDirection: false,
  isCapturedByDistance: false,
  targetDistance: 0,
  targetHeight: 0,
  targetVelocity: 0,
  targetParam: 0
})

let rayWidth = computed(() => snr.value?.radarRayWidth)
let distanceScreenScale = computed(() => snrDistanceScreen.value?.screenScale);

const setRayWidth = (v: number) => snr.value!.setRadarRayWidth(v);
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => snr.value?.resetCaptureTargetByDistance();
const setDistanceScreenScale = (v: number) => snrDistanceScreen.value?.setScale(v);

function SNRListener(property: string, value: number | boolean) {
  property === 'isCapturedByDirection' && (params.isCapturedByDirection = value)
  property === 'isCapturedByDistance' && (params.isCapturedByDistance = value)
  property === 'targetDistance' && (params.targetDistance = value)
  property === 'targetHeight' && (params.targetHeight = value)
  property === 'targetVelocity' && (params.targetVelocity = value)
  property === 'targetParam' && (params.targetParam = value)
}

function launchMissile() {
  if (snr.value!.trackedTarget) {
    const missile = new SAMissile(snr.value!.trackedTarget as FlightObject, 25, 900, { x: 0, y: 0, z: 0.03 })
    missile.launch();
    snr.value!.addMissile(missile);
  }
}

onMounted(() => {
  const initialParams = {
    initialDistance: 30,
    maxDistance: 150,
    minVerticalAngle: -5,
    maxVerticalAngle: 75,
    missileVelocity: 900,
    missileMaxDistance: 25,
    distanceDetectRange: 0.5,
    initialRayWidth: 20,
  }
  const snrTargetScreen = new SNRTargetScreen(targetScreenRef.value!);
  snrDistanceScreen.value = new SNRDistanceScreen(distanceScreenRef.value!, initialParams.maxDistance, initialParams.distanceDetectRange, initialParams.initialDistance, initialParams.missileMaxDistance);
  const snrIndicatorsScreen = new SNRIndicatorsScreen(snrIndicatorsRef.value!, initialParams.minVerticalAngle, initialParams.maxVerticalAngle)
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
      'KeyA': () => snr.value?.setAzimut(snr.value.azimutDeg - 0.05),
      'KeyD': () => snr.value?.setAzimut(snr.value.azimutDeg + 0.05),
      'KeyW': () => snr.value?.setVerticalAngle(snr.value.verticalAngleDeg + 0.05),
      'KeyS': () => snr.value?.setVerticalAngle(snr.value.verticalAngleDeg - 0.05),
      'Space': () => {
        snr.value?.captureTargetByDirection()
        snr.value?.captureTargetByDistance()
      },
      'KeyQ': () => snr.value?.setIndicatorTargetDistance(snr.value.indicatorTargetDistance - 0.2),
      'KeyE': () => snr.value?.setIndicatorTargetDistance(snr.value.indicatorTargetDistance + 0.2)
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  snr
})
</script>