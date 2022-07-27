<template>
  <v-card class="px-6 py-6">
    <div class="d-flex">
      <v-card>
        <canvas ref="targetScreenRef" width="600" height="600" class="border"></canvas>
        <div class="d-flex justify-center pb-2">
          <v-btn-group>
            <v-btn color="warning">AC-1</v-btn>
            <v-btn>
              <v-icon>mdi-arrow-left-bold</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-arrow-right-bold</v-icon>
            </v-btn>


            <v-btn>
              <v-icon>mdi-arrow-up-bold</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-arrow-down-bold</v-icon>
            </v-btn>
            <v-btn color="warning">AC-2</v-btn>
          </v-btn-group>
        </div>
      </v-card>
      <v-spacer />
      <canvas ref="distanceScreenRef" width="400" height="600" class="border"></canvas>


    </div>
  </v-card>
</template>

<script setup lang="ts">
import SNR from '@/classes/SNR';
import { onMounted, ref } from 'vue';
const targetScreenRef = ref<HTMLCanvasElement | null>(null);
const snr = ref<SNR | null>(null);
onMounted(() => {
  snr.value = new SNR(targetScreenRef.value!);
});

defineExpose({
  snr
})
</script>