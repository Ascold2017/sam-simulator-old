<template>
  <div>
    <div class="d-flex justify-center align-start">
      <canvas ref="editorRef" width="1000" height="1000" class="map-image border" style="background-size: contain;"
        @click="exportCoordinates"></canvas>
      <v-card>
        <v-card-text>
          <h3 class="mb-3">Нанесите точки полета и задайте параметры цели</h3>
          <v-text-field label="Эффективная площадь рассеивания" :model-value="rcs" @update:model-value="setRCS" />
          <v-text-field label="Запустить через, сек" :model-value="timeOffset" @update:model-value="setTimeOffset" />
          <h5>Машрут</h5>
          <v-table density="compact">
            <thead>
              <tr>
                <td>X</td>
                <td>Y</td>
                <td>Высота, км</td>
                <td>Скорость, м/с</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(point, i) in points" :key="i">
                <td>{{ point.x }}</td>
                <td>{{ point.y }}</td>
                <td>
                  <v-text-field hide-details density="compact" variant="outlined" :model-value="point.z"
                    @update:model-value="setPointParam(i, 'z', $event)" />
                </td>
                <td v-show="i < points.length -1">
                  <v-text-field hide-details density="compact" variant="outlined" :model-value="point.v"
                    @update:model-value="setPointParam(i, 'v', $event)" />
                </td>
              </tr>
            </tbody>
          </v-table>
          <div class="d-flex mb-6">
            <p style="width: 50%">
              Дальность полета: {{ flightParams.range }} км
            </p>
            <p style="width: 50%">
              Полетное время: {{ flightParams.time }} мин
            </p>
          </div>
          <v-btn-group class="mb-6">
            <v-btn @click="resetPoints" color="warning">Сбросить</v-btn>
            <v-btn @click="addFlightMission" :disabled="points.length < 2" color="success">Добавить полетное задание
            </v-btn>
            <v-btn @click="clear" color="error">Очистить все</v-btn>
            <v-btn @click="exportFlightMissions">Экспорт</v-btn>
          </v-btn-group>
          <v-divider class="mb-6" />

          <v-text-field v-model="flightMissionsString" label="Вставьте код миссии" class="mb-3" hide-details
            append-icon="mdi-upload" @click:append="importFlightMissions"></v-text-field>

          <v-btn @click="startFlightMissions" block color="error">Начать запуски</v-btn>
        </v-card-text>


      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Editor from '@/classes/Editor';
import type FlightObject from '@/classes/FlightObject';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
const emit = defineEmits<{ (e: 'addFlightObject', flightObject: FlightObject): void }>()
const editorRef = ref<HTMLCanvasElement | null>(null);
const editor = ref<Editor | null>(null);
const flightMissionsString = ref<string>('');

onMounted(() => {
  editor.value = new Editor(editorRef.value!);
})
const exportCoordinates = (e: MouseEvent) => editor.value?.addPoint(e)
const setPointParam = (index: number, paramName: string, paramValue: number) => editor.value?.setParamAtPoint(index, paramName, paramValue);
const rcs = computed(() => editor.value?.rcs);
const setRCS = (v: string) => editor.value!.rcs = v as unknown as number
const timeOffset = computed(() => editor.value?.timeOffset);
const setTimeOffset = (v: string) => editor.value!.timeOffset = v as unknown as number

const points = computed(() => editor.value?.points || []);

const flightParams = computed(() => editor.value?.flightParams || { time: 0, range: 0 })

const resetPoints = () => editor.value?.reset()
const clear = () => editor.value?.clear()
const exportFlightMissions = () => editor.value?.exportFlightMissions();
const importFlightMissions = () => editor.value?.importFlightMissions(flightMissionsString.value);
const startFlightMissions = () => {
  editor.value?.startFlightMissions(flightObject => emit('addFlightObject', flightObject))
}
function addFlightMission() {
  if (points.value.length < 2) return
  editor.value!.addFlightMission();
}
</script>