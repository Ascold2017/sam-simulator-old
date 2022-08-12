<template>
  <v-container fluid class="px-6 ">
    <div class="d-flex justify-center">
      <v-stage :config="{ width: 1420, height: 900 }">
        <v-layer>
          <SupplyPanel />
          <ParamsPanel />
          <TVPanel />
          <MainRadarPanel />
          <WeaponPanel />
          <CapturePanel />
        </v-layer>
        <v-layer>
          <MainRadarDisplay v-if="mainRadar.viewMode === ViewModes.MainRadar" />
          <TargetRadarDisplay v-if="mainRadar.viewMode === ViewModes.TargetRadar" />
        </v-layer>
      </v-stage>
    </div>

  </v-container>
</template>

<script setup lang="ts">
import MainRadarPanel from './MainRadarPanel.vue';
import TVPanel from './TVPanel.vue';
import ParamsPanel from './ParamsPanel.vue';
import SupplyPanel from './SupplyPanel.vue';
import WeaponPanel from './WeaponPanel.vue';
import CapturePanel from './CapturePanel.vue';
import MainRadarDisplay from './MainRadarDisplay.vue';
import TargetRadarDisplay from './TargetRadarDisplay.vue';
import { useMainRadarStore, ViewModes } from '@/store/mainRadarPanel';

const mainRadar = useMainRadarStore()
</script>