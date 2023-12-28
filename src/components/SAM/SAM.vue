<template>
  <v-container fluid class="px-6 ">
    <div class="d-flex justify-center">
      <vk-stage :config="{ width: 1200, height: 660 }">
        <vk-layer>
          <ControlPanel />
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
import ControlPanel from './ControlPanel/Panel.vue';
import MainRadarDisplay from './MainRadarDisplay/Display.vue';

</script>