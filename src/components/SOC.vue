<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col>
          <canvas ref="radarRef" width=650 height=650 style="display: block; margin: 0 auto;"></canvas>
          <div class="d-flex">
            <v-radio-group :model-value="scale" @update:model-value="setScale" inline label="Масштаб">
              <v-radio label="150 km" :value="2" />
              <v-radio label="100 km" :value="3" />
              <v-radio label="50 km" :value="6" />
            </v-radio-group>
            <v-btn color="error" icon @click="exportAzimut">ЦУ</v-btn>
          </div>
          <v-slider min="0" max="360" :step="1" :model-value="targetRayAngle" @update:model-value="setTargetRayAnge"
            thumb-label label="Азимут" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import type FlightObject from '@/classes/FlightObject';
import Radar from '@/classes/Radar';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
const emit = defineEmits<{ (e: 'exportAzimut', azimut: number): void }>()
const radarRef = ref<HTMLCanvasElement | null>(null);

const radar = ref<Radar | null>(null);
const targetRayAngle = computed(() => {
  return radar.value?.targetRayAngle || 0;
});
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
  radar.value = new Radar({
    scale: scale.value,
    canvasRadar: radarRef.value,
    rayWidth: 8
  });
});

function addFlightObject(flightObject: FlightObject) {
  radar.value?.addFlightObject(flightObject);
}

function exportAzimut() {
  emit('exportAzimut', targetRayAngle.value);
}

defineExpose({
  addFlightObject
})
</script>