<template>
    <vk-group :config="{ x: 20, y: 205 }">
        <vk-line :config="{ points: [0, 0, 255, 0], stroke: '#181818', strokeWidth: 2, shadowBlur: 5 }" />
        <vk-text :config="{
            x: 80, y: 10,
            text: 'MISSILES',
            fill: '#181818',
            fontFamily: 'DS-DigitalB',
            fontSize: 14,
            textAlign: 'center',
            width: 100
        }" />

        <vk-group :config="{ x: 0, y: 35 }">
            <vk-circle v-for="(rocket, i) in missilesRockets" :config="{
                x: 42 * i + 20,
                y: 10,
                width: 20,
                height: 20,
                fill: true ? 'rgb(150, 249, 123)' : 'red',
                shadowBlur: 5
            }" />
        </vk-group>

        <MissileChannel v-for="(missileChannel, i) in missileChannels" :index="i" />
    </vk-group>
</template>

<script setup lang="ts">
import MissileChannel from './MissileChannel.vue'
import SAM_PARAMS from '@/const/SAM_PARAMS';

const missilesRockets = Array.from(Array(SAM_PARAMS.MISSILES_COUNT));
const missileChannels = Array.from(Array(SAM_PARAMS.MISSILES_CHANNEL_COUNT))
</script>

