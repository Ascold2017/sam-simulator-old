<template>
  <v-card class="px-6 py-6">
    <div class="d-flex justify-space-between">
      <v-card>
        <canvas ref="targetScreenRef" width="600" height="600" class="border"></canvas>
      </v-card>
      <v-card class="flex-1 px-3 py-3 d-flex flex-column">
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
            @update:model-value="setDistanceScreenScale" hide-details class="flex-grow-0">
            <v-radio :value="1" label="150 km"></v-radio>
            <v-radio :value="0.5" label="75 km"></v-radio>
            <v-radio :value="0.3" label="45 km"></v-radio>
          </v-radio-group>


          <v-divider class="mt-auto" />
          <div class="d-flex justify-space-between mt-3">
            <v-icon :color="isCapturedByDirection ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon> <span
              class="pr-3">AC-1</span>
            <v-btn small color="warning" class="mr-3" :disabled="!isCapturedByDirection"
              @click="resetCaptureTargetByDirection">Сброс</v-btn>
            <v-divider vertical />
            <v-btn small color="warning" class="ml-3" :disabled="!isCapturedByDistance"
              @click="resetCaptureTargetByDistance">Сброс</v-btn>
            <span class="pl-3">AC-2</span>
            <v-icon :color="isCapturedByDistance ? 'success' : 'warning'">mdi-checkbox-blank-circle</v-icon>
          </div>
        </div>


      </v-card>
      <v-card>
        <canvas ref="distanceScreenRef" width="400" height="600" class="border"></canvas>
      </v-card>


    </div>
  </v-card>
</template>

<script setup lang="ts">
import SNR from '@/classes/SNR';
import { computed } from '@vue/reactivity';
import { onMounted, ref, watch } from 'vue';
const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const distanceScreenRef = ref<HTMLCanvasElement | null>(null);
const snrIndicatorsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);
let isCapturedByDirection = ref(false);
let isCapturedByDistance = ref(false);

let rayWidth = computed(() => snr.value?.rayWidth)
let distanceScreenScale = computed(() => snr.value?.distanceScreenScale);

const setRayWidth = (v: number) => snr.value!.setRayWidth(v);
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();
const resetCaptureTargetByDistance = () => snr.value?.resetCaptureTargetByDistance();
const setDistanceScreenScale = (v: number) => snr.value?.setDistanceScreenScale(v);

function SNRListener(property: string, value: any) {
  if (property === 'isCapturedByDirection') {
    isCapturedByDirection.value = value;
  }
  if (property === 'isCapturedByDistance') {
    isCapturedByDistance.value = value;
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