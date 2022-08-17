<template>
  <vk-rect :config="{
    name: props.name,
    x: props.x,
    y: props.y,
    width: props.small ? 40 : 60,
    height: props.small ? 40 : 60,
    fill: props.color || '#181818',
    shadowBlur: props.value ? 0 : 5,
    cornerRadius: props.circle ? 60 : 0
  }" />

  <vk-text :config="{
    x: props.x,
    y: props.y,
    width: props.small ? 40 : 60,
    height: props.small ? 40 : 60,
    name: props.name,
    text: props.label,
    fill: props.value ? 'rgb(150, 249, 123)' : 'white',
    align: 'center',
    verticalAlign: 'middle',
    fontSize: props.small ? 11 : 13,
    fontFamily: 'Russo One, sans-serif'
  }" @click="click" />
</template>


<script setup lang="ts">
import Sounds from '@/classes/Sounds';

const props = defineProps<{ x: number; y: number; name: string; value: boolean; label: string; small?: boolean; circle?: boolean; color?: string; }>();
const emit = defineEmits<{ (e: 'click'): void }>();
const click = () => {
  Sounds.click();
  emit('click');
}
</script>