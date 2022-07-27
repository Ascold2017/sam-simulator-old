<template>
  <v-card class="px-6 py-6">
    <div class="d-flex justify-space-between">
      <v-card>
        <canvas ref="targetScreenRef" width="600" height="600" class="border"></canvas>
        <div class="d-flex justify-center pb-2">
          <v-btn-group>
            <v-btn color="warning" @click="captureTargetByDirection">AC-1</v-btn>
            <v-btn color="error" @click="resetCaptureTargetByDirection">Сброс AC-1</v-btn>
          </v-btn-group>
        </div>
      </v-card>
      <div class="flex-1">
        <canvas ref="snrIndicatorsRef" width="400" height="200"></canvas>
        <v-radio-group inline :model-value="rayWidth" @update:model-value="setRayWidth">
          <v-radio :value="20" label="Широкий луч (20*)"></v-radio>
          <v-radio :value="4" label="Узкий луч (4*)"></v-radio>
          <v-radio :value="1.7" label="Подсвет (1.7*)"></v-radio>
        </v-radio-group>
      </div>
      <v-card>
        <canvas ref="distanceScreenRef" width="400" height="600" class="border"></canvas>
      </v-card>


    </div>
  </v-card>
</template>

<script setup lang="ts">
import SNR from '@/classes/SNR';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const snrIndicatorsRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);

const rayWidth = computed(() => {
  return snr.value?.rayWidth;
})

const setRayWidth = (v: number) => snr.value!.setRayWidth(v);
const captureTargetByDirection = () => snr.value?.captureTargetByDirection();
const resetCaptureTargetByDirection = () => snr.value?.resetCaptureTargetByDirection();

onMounted(() => {
  snr.value = new SNR(targetScreenRef.value!, snrIndicatorsRef.value!);
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      'ArrowLeft': () => snr.value?.setAzimut(snr.value.azimut - 0.1),
      'ArrowRight': () => snr.value?.setAzimut(snr.value.azimut + 0.1),
      'ArrowUp': () => snr.value?.setVerticalAngle(snr.value.verticalAngle + 0.1),
      'ArrowDown': () => snr.value?.setVerticalAngle(snr.value.verticalAngle - 0.1),
      'Space': () => snr.value?.captureTargetByDirection()
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  snr
})
</script>