<template>
  <v-dialog v-model="isActive" max-width="250">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon style="position: fixed; top: 10px; left: 10px; z-index: 1">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>
    <v-card class="px-3 py-3">
      <v-btn variant="text" @click="openScreen('SAM')">Back</v-btn>
      <v-btn variant="text" v-for="mission in MISSIONS" @click="loadMission(mission.id)">{{ mission.name }}</v-btn>
      <v-btn variant="text" @click="openScreen('Editor')">Mission editor</v-btn>
      <!--
      <v-btn-toggle mandatory :model-value="acceleration" @update:model-value="setAcceleration">
        <v-btn :value="1">1X</v-btn>
        <v-btn :value="2">2X</v-btn>
        <v-btn :value="4">4X</v-btn>
        <v-btn :value="8">8X</v-btn>
      </v-btn-toggle>
      -->
    </v-card>

  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';
import MISSIONS from '@/const/MISSIONS';
import { inject } from 'vue';
import type Engine from '@/core/Engine/Engine';
import type { IMission } from '@/core/Engine/Engine';
const engine = inject<Engine>("engine")
const emit = defineEmits<{
  (e: 'openScreen', screen: string): void;
}>();

const isActive = ref(true)

const openScreen = (screen: string) => {
  emit('openScreen', screen);
  isActive.value = false;
}

const loadMission = (missionId: number) => {
  engine?.startMission(JSON.parse(MISSIONS.find(m => m.id === missionId)!.data) as IMission[])
  isActive.value = false;
}
/*
const acceleration = ref((window as any).__ACCELERATION__ as number);
const setAcceleration = (value: number) => {
  acceleration.value = value;
  (window as any).__ACCELERATION__ = value;
}
*/
</script>