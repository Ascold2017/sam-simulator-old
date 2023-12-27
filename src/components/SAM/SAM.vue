<template>
  <v-container fluid class="px-6 ">
    <div class="d-flex justify-center">
      <vk-stage :config="{ width: 1200, height: 660 }">
        <vk-layer>
          <TopPanel />
          <MainRadarPanel />
        </vk-layer>
        <vk-layer>
          <MainRadarDisplay />
        </vk-layer>
      </vk-stage>
    </div>

  </v-container>
</template>

<script setup lang="ts">
import MainRadarPanel from './MainRadarPanel.vue';
import TopPanel from './TopPanel.vue';
import MainRadarDisplay from './MainRadarDisplay.vue';

</script>