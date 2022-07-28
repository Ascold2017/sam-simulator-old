<template>
  <div class="px-6 py-6">
    <div class="d-flex">
    <div class="d-flex" style="margin: 0 auto">
      <v-card class="px-2 py-2">
        <canvas ref="radarRef" width=650 height=650 class="border"></canvas>
      </v-card>
      <v-card width="300" class="flex-1 px-2 py-2 ml-3 d-flex flex-column">

        <v-radio-group class="flex-grow-0" :model-value="scale" @update:model-value="setScale" label="Масштаб">
          <v-radio label="150 km" :value="2" />
          <v-radio label="100 km" :value="3" />
          <v-radio label="50 km" :value="6" />
        </v-radio-group>
        <v-btn color="warning" block @click="exportAzimut" class="mt-auto flex-grow-0">ЦУ</v-btn>

      </v-card>
</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type FlightObject from '@/classes/FlightObject';
import SOC from '@/classes/SOC';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
const emit = defineEmits<{ (e: 'exportAzimut', azimut: number): void }>()
const radarRef = ref<HTMLCanvasElement | null>(null);

const radar = ref<SOC | null>(null);

const setTargetRayAnge = (v: number) => {
  radar.value!.targetRayAngle = v;
}
const scale = computed(() => {
  return radar.value?.scale;
});
const setScale = (v: number) => {
  radar.value!.scale = v;
}

onMounted(() => {
  radar.value = new SOC({
    scale: scale.value,
    canvasRadar: radarRef.value,
    rayWidth: 8
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === 'KeyA') {
      setTargetRayAnge(radar.value!.targetRayAngle - 0.5)
    }
    if (event.code === 'KeyD') {
      setTargetRayAnge(radar.value!.targetRayAngle + 0.5)
    }
  })
});

function addFlightObject(flightObject: FlightObject) {
  radar.value?.addFlightObject(flightObject);
}

function exportAzimut() {
  emit('exportAzimut', radar.value!.targetRayAngle);
}

defineExpose({
  addFlightObject
})
</script>