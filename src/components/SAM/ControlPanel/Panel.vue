<template>
    <vk-group :config="{
        x: 890,
        y: 0,
    }">
        <vk-rect :config="{
            x: 0,
            y: 0,
            width: 300,
            height: 660,
            fill: 'grey', shadowBlur: 10, cornerRadius: 6,
        }" />
        <Power />
        <TargetSelect />
        <MissileChannels />
    </vk-group>
</template>
  
<script setup lang="ts">
import Power from "./Power.vue";
import TargetSelect from './TargetSelect.vue';
import MissileChannels from './MissileChannels.vue';

</script>