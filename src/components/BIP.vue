<template>
  <div class="px-6">
    <div class="d-flex">
      <v-card style="margin: 0 auto">
        <canvas ref="bipRef" width="1000" height="1000" class="map-image responsive-canvas border"
          style="background-size: contain;"></canvas>
      </v-card>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Bip from "@/classes/Bip";
import type FlightObject from "@/classes/FlightObject";
import { computed } from '@vue/reactivity';

const bipRef = ref<HTMLCanvasElement | null>(null);
const bip = ref<Bip | null>(null)

onMounted(() => {
  bip.value = new Bip({
    canvasBip: bipRef.value!
  });
});

function addFlightObject(flightObject: FlightObject) {
  bip.value?.addFlightObject(flightObject)
}

defineExpose({
  addFlightObject,
  bip
});
</script>

<style>
.responsive-canvas {
  display: block;
  max-width: 100%;
  height: calc(100vh - 96px);
}
</style>