<template>
  <vk-group>
    <vk-arc :config="{
      x: 310, y: 310,
      innerRadius: indicatorTarget.radius,
      outerRadius: indicatorTarget.radius,
      angle: indicatorTarget.angle,
      rotation: indicatorTarget.rotation,
      strokeWidth: indicatorTarget.strokeWidth,
      stroke: `rgba(150, 249, 123, ${indicatorTarget.alpha})`
    }" />
    <vk-arc v-if="indicatorTarget.isDetected && indicatorTarget.isEnemy" :config="{
      x: indicatorTarget.x + 310,
      y: indicatorTarget.y + 310,
      innerRadius: 10,
      outerRadius: 10,
      strokeWidth: indicatorTarget.isCurrent ? 2 : 0.5,
      dash: indicatorTarget.isCurrent ? [2, 2] : [],
      angle: 360,
      stroke: indicatorTarget.isSelected ? 'red' : 'rgb(150, 249, 123)'
    }" />
    <vk-arc v-if="indicatorTarget.isDetected && !indicatorTarget.isEnemy" :config="{
      x: indicatorTarget.x + 310,
      y: indicatorTarget.y + 310,
      innerRadius: 5,
      outerRadius: 5,
      strokeWidth: 1,
      angle: 360,
      stroke: 'red'
    }" />

    <vk-group v-if="indicatorTarget.isDetected && indicatorTarget.isEnemy" :config="{
      x: indicatorTarget.x + 310,
      y: indicatorTarget.y + 310, rotation: indicatorTarget.direction
    }">
      <vk-line :config="{ points: [10, 0, 30, 0], stroke: 'white', strokeWidth: 1 }" />
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import SAM_PARAMS from '@/const/SAM_PARAMS';
import type BaseRadarObject from '@/core/SAM/RadarObject/BaseRadarObject';
import DetectedRadarObject from '@/core/SAM/RadarObject/DetectedRadarObject';
import type { SAM } from '@/core/SAM/SAM';
import { useMainStore } from '@/store/main';
import { inject } from 'vue';
import { computed } from 'vue';

interface IRadarIndicatorTarget {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  angle: number;
  strokeWidth: number;
  alpha: number;
  isDetected: boolean;
  isEnemy: boolean;
  isSelected: boolean;
  isCurrent: boolean;
  direction: number;
}

const props = defineProps<{ target: BaseRadarObject; scale: number }>();
const sam = inject<SAM>("sam");
const mainStore = useMainStore();

const indicatorTarget = computed<IRadarIndicatorTarget>(() => {
  const canvasTargetArcAngle = (props.target.size * 1000 * 180) / (props.target.distance * Math.PI) + SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY * 2;
  const targetSpotDistance = SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / (props.scale * 2);
  return {
    x: props.target.x / (props.scale * 2),
    y: props.target.y / (props.scale * 2),
    radius: props.target.distance / (props.scale * 2),
    rotation: props.target.azimuth * (180 / Math.PI) - canvasTargetArcAngle / 2,
    angle: canvasTargetArcAngle,
    strokeWidth: targetSpotDistance,
    alpha: props.target.visibilityK * 1,
    isDetected: props.target instanceof DetectedRadarObject,
    isEnemy: props.target instanceof DetectedRadarObject && !props.target.isMissile,
    isSelected: !!sam?.getSelectedObjects().find(so => so.id === props.target.id),
    isCurrent: sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject && !fo.isMissile).findIndex(fo => fo.id === props.target.id) === mainStore.currentTargetIndex,
    direction: props.target.rotation * (190 / Math.PI)
  }
});

</script>