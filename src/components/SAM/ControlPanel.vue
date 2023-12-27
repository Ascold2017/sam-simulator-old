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
    <!-- Power -->
    <vk-group :config="{ x: 20, y: 20 }">
      <vk-text :config="{
        x: 0,
        y: 20,
        height: 20,
        verticalAlign: 'middle',
        text: 'POWER',
        fill: '#181818',
        fontFamily: 'Russo One, sans-serif',
        fontSize: 12
      }" />
      <vk-circle :config="{
        name: 'powerIndicator',
        x: 95,
        y: 30,
        width: 20,
        height: 20,
        fill: mainStore.isEnabled ? 'rgb(150, 249, 123)' : 'red',
        shadowBlur: 5
      }" />
      <SAMButton label="ON" :x="130" :y="0" name="powerOn" :value="!!mainStore.isEnabled"
        @click="mainStore.setIsEnabled(true)" />
      <SAMButton label="OFF" :x="195" :y="0" name="powerOff" :value="!mainStore.isEnabled"
        @click="mainStore.setIsEnabled(false)" />
    </vk-group>

    <vk-line :config="{ points: [20, 90, 275, 90], stroke: '#181818', strokeWidth: 2, shadowBlur: 5 }" />
    <vk-text :config="{
      x: 100, y: 100, 
      text: 'SELECT TARGET', 
      fill: '#181818',
      fontFamily: 'Russo One, sans-serif',
      fontSize: 12,
      textAlign: 'center',
      width: 100
      }"
    />

   <!-- Target select -->
    <vk-group :config="{ x: 20, y: 120 }">
      <SAMButton label="SEEK" :x="0" :y="0" name="seekTarget" @click="mainStore.seekTarget()" :value="false"/>
      <SAMButton label="SLCT" :x="65" :y="0" name="selectTarget" @click="selectTarget" :value="false"/>
      <SAMButton label="UNSLCT" :x="130" :y="0" name="uselectTarget" @click="unselectTarget" :value="false"/>
      <SAMButton label="RST" :x="195" :y="0" name="resetTargets" @click="resetTargets" :value="false"/>
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import SAMButton from "./SAMButton.vue";
import { inject } from "vue";
import type { SAM } from "@/core/SAM/SAM";
import { useMainStore } from "@/store/main";
import DetectedRadarObject from "@/core/SAM/RadarObject/DetectedRadarObject";

const sam = inject<SAM>("sam");

const mainStore = useMainStore();

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