<template>
    <vk-group :config="{ x: 20, y: 100 }">
        <vk-line :config="{ points: [0, 0, 255, 0], stroke: '#181818', strokeWidth: 2, shadowBlur: 5 }" />
        <vk-text :config="{
            x: 80, y: 10,
            text: 'SELECT TARGET',
            fill: '#181818',
            fontFamily: 'DS-DigitalB',
            fontSize: 14,
            textAlign: 'center',
            width: 100
        }" />
        <SAMButton label="SEEK" :x="0" :y="30" name="seekTarget" @click="mainStore.seekTarget()" :value="false" />
        <SAMButton label="SLCT" :x="65" :y="30" name="selectTarget" @click="selectTarget" :value="false" />
        <SAMButton label="UNSLCT" :x="130" :y="30" name="uselectTarget" @click="unselectTarget" :value="false" />
        <SAMButton label="RST" :x="195" :y="30" name="resetTargets" @click="resetTargets" :value="false" />
    </vk-group>
</template>

<script setup lang="ts">
import SAMButton from '../SAMButton.vue';
import DetectedRadarObject from "@/core/SAM/RadarObject/DetectedRadarObject";
import type { SAM } from "@/core/SAM/SAM";
import { useMainStore } from "@/store/main";
import { inject } from "vue";
const mainStore = useMainStore();
const sam = inject<SAM>("sam");
function selectTarget() {
    const target = sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject)[mainStore.currentTargetIndex];
    target && sam?.selectTarget(target.id);
}

function unselectTarget() {
    const target = sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject)[mainStore.currentTargetIndex];
    target && sam?.unselectTarget(target.id);
}

function resetTargets() {
    mainStore.resetCurrentTarget();
    sam?.resetTargets();
}

</script>