<template>
  <vk-group :config="{
    x: 810,
    y: 0,
  }">
    <vk-rect :config="{
      name: 'panelWeapon',
      x: 0,
      y: 0,
      width: 600,
      height: 150,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />


    <!-- Missile indicators-->
    <vk-group :config="{ x: 20, y: 0 }">
      <vk-circle
        :config="{ width: 20, x: 60, y: 30, fill: weaponPanel.isMissileReady ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <vk-text :config="{
        x: 20,
        y: 50,
        width: 80,
        text: 'Готов',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <vk-circle
        :config="{ width: 20, x: 140, y: 30, fill: inRange ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <vk-text :config="{
        x: 100,
        y: 50,
        width: 80,
        text: 'Зона',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <vk-circle
        :config="{ width: 20, x: 220, y: 30, fill: isLaunched ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <vk-text :config="{
        x: 180,
        y: 50,
        width: 80,
        text: 'Пуск',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <vk-circle
        :config="{ width: 20, x: 300, y: 30, fill: isReset ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <vk-text :config="{
        x: 260,
        y: 50,
        width: 80,
        text: 'Сброс',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />
    </vk-group>
    <!-- Missile selector -->
    <vk-group :config="{ x: 20, y: 80 }">
      <vk-line :config="{ points: [0, 0, 140, 0], stroke: '#181818', shadowBlur: 2 }" />
      <vk-text :config="{
        x: 140,
        y: -10,
        width: 100,
        height: 20,
      
        text: 'Выбор ракеты',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
        align: 'center',
        verticalAlign: 'middle',
      }" />
      <vk-line :config="{ points: [240, 0, 360, 0], stroke: '#181818', shadowBlur: 2 }" />
      <SAMButton v-for="missile in weaponPanel.missiles" :x="45.75 * (missile.id - 1)" :y="15"
        :name="'missile_' + missile.id" small :label="`${missile.id}`"
        :value="weaponPanel.currentMissileId === missile.id" @click="weaponPanel.selectMissile(missile.id)" />
    </vk-group>
    <vk-group :config="{ x: 400, y: 10 }">
      
      <SAMButton :x="120" :y="0" name="launch" label="ПУСК" :value="false" color="red" @click="weaponPanel.launchMissile" />

      
    </vk-group>
  </vk-group>
</template>

<script setup lang="ts">
import { useTargetRadarStore } from "@/store/targetRadar";
import { useWeaponPanelStore } from "@/store/weaponPanel";
import { computed } from "@vue/reactivity";
import SAMButton from "./SAMButton.vue";

const weaponPanel = useWeaponPanelStore();
const targetRadar = useTargetRadarStore()

const inRange = computed(() => {
  if (!targetRadar.isCapturedAll || !weaponPanel.currentMissile || !targetRadar.capturedTarget) return false;
  return targetRadar.distanceToHit <= weaponPanel.currentMissile.maxDistance;
});

const isLaunched = computed(() => {
  if (!weaponPanel.currentMissile) return false;
  return weaponPanel.currentMissile.isLaunched
});

const isReset = computed(() => {
  if (!weaponPanel.currentMissile) return false
  return weaponPanel.currentMissile.isDestroyed
})
</script>