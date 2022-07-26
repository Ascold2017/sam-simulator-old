<template>
  <v-card>
    <v-row>
      <v-col cols="6">
        <canvas ref="targetScreenRef" width="600" height="600"></canvas>
      </v-col>
      <v-divider vertical />
      <v-col cols="6">
        <canvas ref="distanceScreenRef" width="400" height="600"></canvas>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
</script>