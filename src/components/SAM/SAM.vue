<template>
  <v-container fluid class="px-6 ">
    <div class="d-flex justify-center">
      <v-stage :config="{ width: 1420, height: 900 }">
        <v-layer>
          <DistancePanel />
          <SupplyPanel />
          <ParamsPanel />
          <ElevationPanel />
          <TVPanel />
          <SOCPanel />
          <WeaponPanel />
        </v-layer>
      </v-stage>
    </div>

  </v-container>
</template>

<script setup lang="ts">
import SOCPanel from './SOCPanel.vue';
import TVPanel from './TVPanel.vue';
import ParamsPanel from './ParamsPanel.vue';
import SupplyPanel from './SupplyPanel.vue';
import WeaponPanel from './WeaponPanel.vue';
import ElevationPanel from './ElevationPanel.vue';
import DistancePanel from './DistancePanel.vue';
</script>