<template>
  <v-container fluid class="px-6">
    <div ref="uiContainer" class="d-flex justify-center"></div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SAMUI from '@/classes/SAMUI';

const uiContainer = ref<HTMLDivElement>();

onMounted(() => {
  new SAMUI(uiContainer.value!)
})

</script>