<template>
  <v-group :config="{ x: props.x, y: props.y }">
    <v-arc :config="{
      x: props.small ? 15 : 25,
      y: 25,
      outerRadius: props.small ? 15 : 25,
      innerRadius: props.small ? 15 : 25,
      stroke: '#181818',
      angle: 360
    }" />
    <v-star :config="{
       x: props.small ? 15 : 25,
      y: 25,
      innerRadius: props.small ? 10 : 18,
      outerRadius: props.small ? 12 : 20,
      numPoints: 30,
      fill: '#222222',
      shadowBlur: 15,
    }" />
    <v-text :config="{
      x: -3,
      y: props.small ? 34 : 43,
      height: 10,
      verticalAlign: 'middle',
      text: '-',
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: '#181818'
    }" />
    <v-text :config="{
      x: props.small ? 28 : 45,
      y:  props.small ? 34 : 43,
      text: '+',
      verticalAlign: 'middle',
      height: 10,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: '#181818'
    }" />
  </v-group>
</template>

<script setup lang="ts">
const props = defineProps<{ x: number; y: number; small?: boolean; }>();
</script>