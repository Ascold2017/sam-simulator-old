<template>
  <v-group :config="{
    x: 410,
    y: 740,
  }">
    <v-rect :config="{
      name: 'panelWeapon',
      x: 0,
      y: 0,
      width: 600,
      height: 160,
      fill: 'grey',
      shadowBlur: 10,
      cornerRadius: 6,
    }" />


    <!-- Missile indicators-->
    <v-group :config="{ x: 20, y: 0 }">
      <v-circle
        :config="{ width: 20, x: 60, y: 30, fill: weaponPanel.missileState === MissileStates.READY ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <v-text :config="{
        x: 20,
        y: 50,
        width: 80,
        text: 'Готов',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <v-circle
        :config="{ width: 20, x: 140, y: 30, fill: weaponPanel.missileState === MissileStates.IN_RANGE ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <v-text :config="{
        x: 100,
        y: 50,
        width: 80,
        text: 'Зона',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <v-circle
        :config="{ width: 20, x: 220, y: 30, fill: weaponPanel.missileState === MissileStates.LAUNCH ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <v-text :config="{
        x: 180,
        y: 50,
        width: 80,
        text: 'Пуск',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />

      <v-circle
        :config="{ width: 20, x: 300, y: 30, fill: weaponPanel.missileState === MissileStates.RESET ? 'rgb(150, 249, 123)' : 'red', shadowBlur: 5 }" />
      <v-text :config="{
        x: 260,
        y: 50,
        width: 80,
        text: 'Сброс',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 13,
        align: 'center'
      }" />
    </v-group>
    <!-- Missile selector -->
    <v-group :config="{ x: 20, y: 80 }">
      <v-line :config="{ points: [0, 0, 120, 0], stroke: '#181818', shadowBlur: 2 }" />
      <v-text :config="{
        x: 120,
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
      <v-line :config="{ points: [220, 0, 360, 0], stroke: '#181818', shadowBlur: 2 }" />
      <SAMButton v-for="missile in weaponPanel.missiles" :x="45.75 * (missile.id - 1)" :y="15"
        :name="'missile_' + missile.id" small :label="`${missile.id}`"
        :value="weaponPanel.currentMissileId === missile.id" @click="weaponPanel.selectMissile(missile.id)" />
    </v-group>
    <v-group :config="{ x: 400, y: 20 }">
      <SAMButton :x="0" :y="0" name="launch" label="ПУСК" :value="false" color="red" />
      <SAMButton :x="120" :y="0" name="return" label="Возврат" :value="false" />

      <v-text :config="{
        x: 0,
        y: 80,
        height: 40,
        text: 'Взрыватель',
        fontFamily: 'Russo One, sans-serif',
        fill: '#181818',
        fontSize: 12,
        verticalAlign: 'middle'
      }" />
      <SAMButton :x="95" :y="80" name="detonatorAuto" label="Авто"
        :value="weaponPanel.detonatorMode === DetonatorModes.AUTO"
        @click="weaponPanel.setDetonatorMode(DetonatorModes.AUTO)" small />
      <SAMButton :x="140" :y="80" name="detonator2Sec" label="2 сек"
        :value="weaponPanel.detonatorMode === DetonatorModes.ON_2_SEC"
        @click="weaponPanel.setDetonatorMode(DetonatorModes.ON_2_SEC)" small />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { useWeaponPanelStore, DetonatorModes, MissileStates } from "@/store/weaponPanel";
import SAMButton from "./SAMButton.vue";

const weaponPanel = useWeaponPanelStore();
</script>