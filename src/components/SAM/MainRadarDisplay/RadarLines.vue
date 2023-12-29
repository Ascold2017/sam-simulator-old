<template>
  <vk-group>
    <vk-circle :config="{ x: 310, y: 310, width: SAM_PARAMS.MAX_DISTANCE / (scale), fill: 'rgb(15, 33, 19)' }" />
    <!-- Distance circles -->
    <vk-circle :config="{ x: 310, y: 310, width: (i * 10000) / scale, stroke: 'rgb(150, 249, 123)', strokeWidth: 0.1 }"
      v-for="i in countCircles" />
    <!-- Max capture range circle -->
    <vk-circle
      :config="{ x: 310, y: 310, width: SAM_PARAMS.MAX_CAPTURE_RANGE / scale, stroke: 'rgb(150, 249, 123)', dash: [2, 5], strokeWidth: 1.5 }" />
    <!-- Min capture range circle -->
    <vk-circle
      :config="{ x: 310, y: 310, width: SAM_PARAMS.MIN_CAPTURE_RANGE / scale, stroke: 'rgb(150, 249, 123)', dash: [2, 5], strokeWidth: 1.5 }" />
    <!-- Killzone circle -->
    <vk-circle
      :config="{ x: 310, y: 310, width: SAM_PARAMS.MISSILE_MAX_DISTANCE / scale, stroke: 'red', strokeWidth: 0.5 }" />
    <!-- Azimut lines -->
    <vk-line :config="{
      points: [azimutLine.x0, azimutLine.y0, azimutLine.x1, azimutLine.y1,],
      stroke: 'rgb(150, 249, 123)',
      strokeWidth: 0.1
    }" v-for="azimutLine in azimutLines" />
    <!-- Azimut labels -->
    <vk-text :config="{
      x: azimutLine.x1,
      y: azimutLine.y1,
      text: azimutLine.angleLabel,
      rotation: +azimutLine.angleLabel,
      offsetX: 12.5,
      offsetY: 12.5,
      align: 'center',
      verticalAlign: 'middle',
      fontFamily: 'DS-Digital, sans-serif',
      fill: 'rgb(150, 249, 123)',
      fontSize: 11,
      width: 25,
      height: 12
    }" v-for="azimutLine in azimutLines" />
   
  </vk-group>
</template>

<script setup lang="ts">
import SAM_PARAMS from '@/const/SAM_PARAMS';
import { computed } from 'vue';

const props = defineProps<{ scale: number }>();

const countCircles = computed(() => SAM_PARAMS.MAX_DISTANCE / 10000);
const azimutLines = computed(() => {
  return Array(36).fill(0).map((_, i) => {
    const cos = Math.cos(i * 10 * (Math.PI / 180) - Math.PI / 2);
    const sin = Math.sin(i * 10 * (Math.PI / 180) - Math.PI / 2);
    return {
      x0: cos * (5000 / props.scale) + 310,
      y0: sin * (5000 / props.scale) + 310,
      x1: cos * (SAM_PARAMS.MAX_DISTANCE / (props.scale * 2)) + 310,
      y1: sin * (SAM_PARAMS.MAX_DISTANCE / (props.scale * 2)) + 310,
      angleLabel: String(i * 10),

    }
  });
});
</script>