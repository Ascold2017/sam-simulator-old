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
import { useMainStore, type IRadarObject } from '@/store/main';
import { computed } from 'vue';

const props = defineProps<{ target: Partial<IRadarObject>; index: number; config: { x: number; y: number; } }>();
const mainStore = useMainStore();
const indicatorTarget = computed(() => {
    return {
        rows: [
            `|${props.target.id}`,
            `| Azimuth: ${(props.target.azimuth! * (180 / Math.PI)).toFixed(1)}°     | Elevation: ${(props.target.elevation! * (180 / Math.PI)).toFixed(1)}°`,
            `| D: ${(props.target.distance! / 1000).toFixed(1)} km      | H: ${props.target.height!.toFixed(0)} m`,
            `| V: ${props.target.velocity} m/s     | P: ${(props.target.param! / 1000).toFixed(1)} km`
        ],
        isCurrent: mainStore.currentTargetId === props.target.id,
        isSelected: mainStore.selectedTargetIds.includes(props.target.id!)
    }
});
</script>