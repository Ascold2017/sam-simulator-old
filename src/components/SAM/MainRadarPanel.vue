<template>
  <vk-group :config="{
    x: 0,
    y: 0,
  }">
    <vk-rect :config="{
      name: 'panel',
      x: 0,
      y: 0,
      width: 860,
      height: 660,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />
  </vk-group>
</template>

<script setup lang="ts">
</script>