<template>
  <vk-group :config="{ x: props.x, y: props.y }">
    <vk-arc :config="{
      x: props.small ? 15 : props.big ? 50 : 25,
      y: 25,
      outerRadius: props.small ? 15 : props.big ? 50 : 25,
      innerRadius: props.small ? 15 : props.big ? 50 : 25,
      stroke: '#181818',
      angle: 360
    }" />
    <vk-star :config="{
       x: props.small ? 15 : props.big ? 50 : 25,
      y: 25,
      innerRadius: props.small ? 10 : props.big ? 38 : 18,
      outerRadius: props.small ? 12 : props.big ? 40 : 20,
      numPoints: 30,
      fill: '#222222',
      shadowBlur: 15,
      rotation
      
    }" @wheel="onWheel"/>
    <vk-text :config="{
      x: -3,
      y: props.small ? 34 : props.big ? 55 : 43,
      height: 10,
      verticalAlign: 'middle',
      text: '-',
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: '#181818'
    }" />
    <vk-text :config="{
      x: props.small ? 28 : props.big ? 95 : 45,
      y:  props.small ? 34 : props.big ? 55 : 43,
      text: '+',
      verticalAlign: 'middle',
      height: 10,
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      fill: '#181818'
    }" />
  </vk-group>
</template>

<script setup lang="ts">
import Sounds from '@/classes/Sounds'
import { ref } from 'vue';
const emit = defineEmits<{ (e: 'change', v: number): void }>()
const props = defineProps<{ x: number; y: number; small?: boolean; big?: boolean; deltaValue?: number }>();
const rotation = ref(0)
const onWheel = ({ evt }: { evt: WheelEvent }) => {
  const delta = evt.deltaY < 0 ? 1 : -1;
  Sounds.rotateClick()
  rotation.value += delta*2;
  emit('change', delta * (props.deltaValue || 1))
}
</script>