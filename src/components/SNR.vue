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
          <p>Д, km: {{ params.targetDistance }}</p>
          <p>V, m/s: {{ params.targetVelocity }}</p>
          <p>H, km: {{ params.targetHeight }}</p>
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
import { onMounted, ref, reactive, computed } from 'vue';
const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const distanceScreenRef = ref<HTMLCanvasElement | null>(null);
const snrIndicatorsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);

const params = reactive<Record<string, boolean | number>>({
  isCapturedByDirection: false,
  isCapturedByDistance: false,
  targetDistance: 0,
  targetHeight: 0,
  targetVelocity: 0
})

let rayWidth = computed(() => snr.value?.rayWidth)
let distanceScreenScale = computed(() => snr.value?.distanceScreenScale);

const setRayWidth = (v: number) => snr.value!.setRayWidth(v);
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => snr.value?.resetCaptureTargetByDistance();
const setDistanceScreenScale = (v: number) => snr.value?.setDistanceScreenScale(v);

function SNRListener(property: string, value: number | boolean) {
  property === 'isCapturedByDirection' && (params.isCapturedByDirection = value)
  property === 'isCapturedByDistance' && (params.isCapturedByDistance = value)
  property === 'targetDistance' && (params.targetDistance = value)
  property === 'targetHeight' && (params.targetHeight = value)
  property === 'targetVelocity' && (params.targetVelocity = value)
}

function launchMissile() {
  if (snr.value!.trackedTarget) {
    const missile = new SAMissile(snr.value!.trackedTarget, 25, 900, { x: 0, y: 0, z: 0.03 })
    missile.launch();
    snr.value!.addMissile(missile);
  }
}

onMounted(() => {
  snr.value = new SNR(targetScreenRef.value!, snrIndicatorsRef.value!, distanceScreenRef.value!, SNRListener);
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      'KeyA': () => snr.value?.setAzimut(snr.value.azimut - 0.1),
      'KeyD': () => snr.value?.setAzimut(snr.value.azimut + 0.1),
      'KeyW': () => snr.value?.setVerticalAngle(snr.value.verticalAngle + 0.1),
      'KeyS': () => snr.value?.setVerticalAngle(snr.value.verticalAngle - 0.1),
      'Space': () => {
        snr.value?.captureTargetByDirection()
        snr.value?.captureTargetByDistance()
      },
      'KeyQ': () => snr.value?.setTargetDistance(snr.value.targetDistance - 0.2),
      'KeyE': () => snr.value?.setTargetDistance(snr.value.targetDistance + 0.2)
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  snr
})
</script>