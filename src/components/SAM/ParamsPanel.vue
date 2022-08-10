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

    <ParamIndicator :config="{ x: 20, y: 20 }" label="Р, км" :min-value="0" :max-value="30" :value="0" :strokes="30"/>
    <ParamIndicator :config="{ x: 185, y: 20 }" label="H, км" :min-value="0" :max-value="20" :value="0" :strokes="40"/>
    <SAMButton :x="350" :y="20" small name="20km" label="20" :value="false" />
    <SAMButton :x="350" :y="70" small name="5km" label="5" :value="false" />
    <SAMButton :x="350" :y="120" small name="1km" label="1" :value="false" />
    <SAMPotentiometer :x="300" :y="110" small/>
  
    <ParamIndicator :config="{ x: 395, y: 20 }" label="V, м/с" :min-value="0" :max-value="1200" :value="0" :strokes="40"/>
    <SAMButton :x="560" :y="20" small name="1200ms" label="1200" :value="false" />
    <SAMButton :x="560" :y="70" small name="5400ms" label="600" :value="false" />
    <SAMButton :x="560" :y="120" small name="400ms" label="400" :value="false" />
    <SAMPotentiometer :x="510" :y="110" small/>
  </v-group>
</template>

<script setup lang="ts">
import ParamIndicator from './ParamIndicator.vue';
import SAMPotentiometer from './SAMPotentiometer.vue';
import SAMButton from './SAMButton.vue';
</script>