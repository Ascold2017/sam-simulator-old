<template>
    <vk-group :config="{ x: 20, y: 205 }">
        <vk-line :config="{ points: [0, 0, 255, 0], stroke: '#181818', strokeWidth: 2, shadowBlur: 5 }" />
        <vk-text :config="{
            x: 100, y: 10,
            text: 'MISSILES',
            fill: '#181818',
            fontFamily: 'DS-DigitalB',
            fontSize: 14,
            textAlign: 'center',
            width: 100
        }" />

        <vk-group :config="{ x: 0, y: 35 }">
            <vk-circle v-for="i in missilesCount" :config="{
                x: 42 * i - 20,
                y: 10,
                width: 20,
                height: 20,
                fill: missilesLeft >= i ? 'rgb(150, 249, 123)' : 'red',
                shadowBlur: 5
            }" />
        </vk-group>

        <MissileChannel v-for="(missileChannel, i) in missileChannels" :index="i" :missileChannel="missileChannel" />
    </vk-group>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MissileChannel from './MissileChannel.vue'
import SAM_PARAMS from '@/const/SAM_PARAMS';
import { inject } from 'vue';
import type { SAM, MissileChannel as MChannel } from '@/core/SAM/SAM';
import type Engine from '@/core/Engine/Engine';
import { onUnmounted } from 'vue';

const missilesCount = SAM_PARAMS.MISSILES_COUNT;
const missilesLeft = ref<number>(SAM_PARAMS.MISSILES_COUNT);
const missileChannels = ref<MChannel[]>([]);
const sam = inject<SAM>("sam");
const engine = inject<Engine>("engine");

onMounted(() => {
    engine?.addFPSLoop("missileChannelsUpdate", () => {
        missileChannels.value = [...(sam?.getMissileChannels() || [])] as MChannel[];
        missilesLeft.value = sam?.getMissilesCount() || 0;
    }, 40);
});

onUnmounted(() => {
    engine?.removeLoop("missileChannelsUpdate");
})
</script>

