<template>
  <v-group :config="{
    x: 410,
    y: 0,
  }">

    <v-rect :config="{
      x: 0,
      y: 0,
      width: 600,
      height: 180,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <ParamIndicator :config="{ x: 30, y: 20 }" label="Р, км" :min-value="0" :max-value="30" :value="0" :strokes="30"/>
    <ParamIndicator :config="{ x: 220, y: 20 }" label="H, км" :min-value="0" :max-value="20" :value="0" :strokes="40"/>
    <ParamIndicator :config="{ x: 410, y: 20 }" label="V, м/с" :min-value="0" :max-value="1200" :value="0" :strokes="40"/>
  </v-group>
</template>

<script setup lang="ts">
import ParamIndicator from './ParamIndicator.vue';
</script>