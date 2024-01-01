<template>
    <vk-group :config="{ x: 20, y: 20 }">
        <vk-rect :config="{
            name: 'display',
            x: -5,
            y: -5,
            width: 830,
            height: 630,
            fill: 'black',
        }" />

        <radar-lines v-if="mainStore.isEnabled" :scale="scale" />
        <!-- targets -->
        <vk-group v-if="mainStore.isEnabled">
            <RadarIndicatorTarget v-for="radarObject in radarObjects" :scale="scale" :target="radarObject" />
            <RadarIndicatorInfo 
                v-for="(targetObject, i) in radarObjectjSyncronized.filter(fo => (fo.type === 'DETECTED_RADAR_OBJECT') && !fo.isMissile)"
                :index="i"
                :config="{ x: 622, y: 0 }" :target="targetObject"
            />
        </vk-group>
    </vk-group>
</template>
  
<script setup lang="ts">
import {  onMounted, ref } from 'vue';
import { useMainStore } from '@/store/main';
import RadarLines from "@/components/SAM/MainRadarDisplay/RadarLines.vue";
import RadarIndicatorTarget from './RadarIndicatorTarget.vue';
import RadarIndicatorInfo from './RadarIndicatorInfo.vue';

const mainStore = useMainStore();

const scale = 140;

const radarObjects = ref<any[]>([]);
const radarObjectjSyncronized = ref<any[]>([]);

onMounted(() => {
    /*
    engine?.addFPSLoop("mainRadarLoopSync", () => {
        radarObjectjSyncronized.value = mainStore.isEnabled ? sam!.getRadarObjects() : []
    }, 40);
    engine?.addFixedLoop("mainRadarLoop", () => {
        radarObjects.value = mainStore.isEnabled ? sam!.getRadarObjects() : []
    }, SAM_PARAMS.RADAR_UPDATE_INTERVAL);
    */
});

</script>