<template>
  <v-card>
    <div class="d-flex">
      <canvas ref="bipRef" width="1000" height="1000" class="responsive-canvas border"
        style="background-image: url(/snazzy-image.png); background-size: contain;"></canvas>
        <v-card>
          <v-list></v-list>
        </v-card>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Bip from "@/classes/Bip";
import type FlightObject from "@/classes/FlightObject";
import { computed } from '@vue/reactivity';


const bipRef = ref<HTMLCanvasElement | null>(null);
const bip = ref<Bip | null>(null)

const messages = computed(() => {
  return bip.value?.messages || []
});

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