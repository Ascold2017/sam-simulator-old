<template>
    <vk-group :config="{ x: config.x, y: config.y + index * 65 }">

        <vk-text v-for="(row, i) in indicatorTarget.rows" :config="{
            x: 0, y: i * 15,
            text: row,
            verticalAlign: 'middle',
            fontFamily: 'DS-DigitalB, sans-serif',
            fill: indicatorTarget.isSelected ? 'red' : 'rgb(150, 249, 123)',
            fontSize: 12,
        }" />
        <vk-rect v-if="indicatorTarget.isCurrent" :config="{
            name: 'currentTarget',
            x: -2,
            y: index - 2,
            width: 202,
            height: 62,
            stroke: 'rgb(150, 249, 123)',
            strokeWidth: 1
        }" />
    </vk-group>
</template>

<script setup lang="ts">
import type DetectedRadarObject from '@/core/SAM/RadarObject/DetectedRadarObject';
import type { SAM } from '@/core/SAM/SAM';
import { useMainStore } from '@/store/main';
import { inject } from 'vue';
import { computed } from 'vue';

const props = defineProps<{ target: Partial<DetectedRadarObject>; index: number; config: { x: number; y: number; } }>();
const mainStore = useMainStore();
const sam = inject<SAM>("sam");
const indicatorTarget = computed(() => {
    return {
        rows: [
            `|${props.target.id}`,
            `| Azimuth: ${(props.target.azimuth! * (180 / Math.PI)).toFixed(1)}°     | Elevation: ${(props.target.elevation! * (180 / Math.PI)).toFixed(1)}°`,
            `| D: ${(props.target.distance! / 1000).toFixed(1)} km      | H: ${props.target.height!.toFixed(0)} m`,
            `| V: ${props.target.velocity} m/s     | P: ${(props.target.param! / 1000).toFixed(1)} km`
        ],
        isCurrent: mainStore.currentTargetIndex === props.index,
        isSelected: !!sam?.getSelectedObjects().find(so => so.id === props.target.id)
    }
});
</script>