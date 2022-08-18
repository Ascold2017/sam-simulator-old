<template>
  <vk-group :config="{
    x: 810,
    y: 0,
  }">

    <vk-rect :config="{
      x: 0,
      y: 0,
      width: 600,
      height: 180,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />

    <!-- Target param indicator -->
    <ParamIndicator :config="{ x: 20, y: 20 }" label="Р, км" :min-value="0" :max-value="50" :value="param"
      :strokes="50" />
    <!-- Target height indicator -->
    <ParamIndicator :config="{ x: 185, y: 20 }" label="H, км" :min-value="0" :max-value="heightIndicatorMaxValue"
      :value="height" :strokes="40" />
    <SAMButton :x="350" :y="20" small name="20km" label="20" :value="heightIndicatorMaxValue === 20"
      @click="heightIndicatorMaxValue = 20" />
    <SAMButton :x="350" :y="70" small name="8km" label="8" :value="heightIndicatorMaxValue === 8"
      @click="heightIndicatorMaxValue = 8" />
    <SAMButton :x="350" :y="120" small name="2km" label="2" :value="heightIndicatorMaxValue === 2"
      @click="heightIndicatorMaxValue = 2" />

    <!-- Target velocity indicator -->
    <ParamIndicator :config="{ x: 395, y: 20 }" label="V, м/с" :min-value="0" :max-value="velocityIndicatorMaxValue"
      :value="velocity" :strokes="40" />
    <SAMButton :x="560" :y="20" small name="1200ms" label="1200" :value="velocityIndicatorMaxValue === 1200"
      @click="velocityIndicatorMaxValue = 1200" />
    <SAMButton :x="560" :y="70" small name="5400ms" label="600" :value="velocityIndicatorMaxValue === 600"
      @click="velocityIndicatorMaxValue = 600" />
    <SAMButton :x="560" :y="120" small name="400ms" label="400" :value="velocityIndicatorMaxValue === 400"
      @click="velocityIndicatorMaxValue = 400" />
  </vk-group>
</template>

<script setup lang="ts">
import ParamIndicator from './ParamIndicator.vue';
import SAMPotentiometer from './SAMPotentiometer.vue';
import SAMButton from './SAMButton.vue';
import { useTargetRadarStore } from '@/store/targetRadar'
import { computed, ref } from 'vue';

const targetRadar = useTargetRadarStore();

const param = computed(() => targetRadar.capturedTarget && targetRadar.isCapturedAll ? targetRadar.capturedTarget.param : 0);
const velocity = computed(() => targetRadar.capturedTarget && targetRadar.isCapturedAll ? targetRadar.capturedTarget.velocity : 0)
const height = computed(() => targetRadar.capturedTarget && targetRadar.isCapturedAll ? targetRadar.capturedTarget.height : 0)

const heightIndicatorMaxValue = ref(20);
const velocityIndicatorMaxValue = ref(1200);
</script>