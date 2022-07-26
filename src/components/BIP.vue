<template>
  <v-card>
    <v-row>
      <v-col cols="8">
        <canvas ref="bipRef" width="1000" height="1000" class="responsive-canvas"
          style="background-image: url(/snazzy-image.png); background-size: contain;"></canvas>
      </v-col>
      <v-divider vertical />
      <v-col>
        <v-card>
          <ul>
            <li v-for="message in messages">{{ message }}</li>
          </ul>
        </v-card>
      </v-col>
    </v-row>

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