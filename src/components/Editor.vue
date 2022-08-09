<template>
  <v-container class="mb-6">
    <v-row justify="center">
      <v-col class="d-flex justify-center">
        <canvas ref="editorRef" width="800" height="800" class="map-image border mx-auto"
          style="background-size: 100%; background-position: center;" @click="exportCoordinates"></canvas>
      </v-col>
      <v-col class="d-flex justify-center">
        <v-card width="800">
          <v-card-text>
            <h3 class="mb-3">Нанесите точки полета и задайте параметры цели</h3>
            <v-select label="Тип обьекта" :items="flightObjectTypes" item-title="name" item-value="id"
              :model-value="flightObjectType!" @update:model-value="setFlightObjectType" />
            <v-text-field label="Запустить через, сек" :model-value="timeOffset" @update:model-value="setTimeOffset" />
            <h4>Машрут | Дальность полета: {{ flightParams.range }} км | Полетное время: {{ flightParams.time }} мин
            </h4>
            <v-table density="compact" class="mb-3">
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
                  <td v-show="i < points.length - 1">
                    <v-text-field hide-details density="compact" variant="outlined" :model-value="point.v"
                      @update:model-value="setPointParam(i, 'v', $event)" type="number" :min="0"
                      :max="flightObjectMaxVelocity" />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="mb-3 d-flex justify-space-between">
              <v-btn @click="addFlightMission" :disabled="points.length < 2" color="success">Добавить полетное задание
              </v-btn>
              <v-btn @click="resetFlightMission" color="warning">Сбросить</v-btn>
            </div>
            <v-divider class="mb-3" />
            <h4>Полетные задания</h4>
            <v-table density="compact" class="mb-3">
              <thead>
                <tr>
                  <td>Тип обьекта</td>
                  <td>Старт через, сек</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="flightObjectMission in flightObjectMissions">
                  <td>{{ flightObjectMission.flightObjectType }}</td>
                  <td>{{ flightObjectMission.startFrom }}</td>
                </tr>
              </tbody>
            </v-table>


            <v-divider class="mb-6" />

            <div class="mb-3 d-flex justify-space-between">
              <v-btn @click="clear" color="error">Очистить все</v-btn>
              <v-btn @click="exportFlightMissions">Скачать <v-icon>mdi-download</v-icon>
              </v-btn>
            </div>

            <v-file-input label="Файл миссии" class="mb-3" hide-details append-icon="mdi-upload"
              @change="importFlightMissions"></v-file-input>

            <v-btn @click="startFlightMissions" block color="error">Старт!</v-btn>
          </v-card-text>


        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import Editor from '@/classes/Editor';
import type SAM from '@/classes/SAM';
import { computed } from '@vue/reactivity';
import { onMounted, ref, inject } from 'vue';

const sam = inject<SAM>('sam')
const editorRef = ref<HTMLCanvasElement | null>(null);
const flightObjectTypes = Editor.flightObjectTypes;

const editor = ref<Editor | null>(null);
onMounted(() => {
  editor.value = new Editor(editorRef.value!);
})


const flightObjectType = ref<number | null>(null);
const flightObjectMaxVelocity = ref<number>(100);
const setFlightObjectType = (value: number) => {
  const foType = flightObjectTypes.find(fo => fo.id === value)!
  flightObjectType.value = value;
  editor.value!.setFlightObjectType(value);
  flightObjectMaxVelocity.value = foType.maxVelocity;
}

const timeOffset = computed(() => editor.value?.timeOffset);
const setTimeOffset = (v: string) => editor.value!.timeOffset = v as unknown as number

const exportCoordinates = (e: MouseEvent) => {
  if (!flightObjectType.value) return;
  editor.value?.addPoint(e)
}
const setPointParam = (index: number, paramName: string, paramValue: number) => editor.value?.setParamAtPoint(index, paramName, paramValue);
const points = computed(() => editor.value?.points || []);
const flightParams = computed(() => editor.value?.flightParams || { time: 0, range: 0 })

const resetFlightMission = () => {
  editor.value?.reset()
  setTimeOffset('0');
  flightObjectType.value = null;
}

const flightObjectMissions = computed(() => (editor.value?.flightObjectMissions || []).map(fm => ({ ...fm, flightObjectType: Editor.flightObjectTypes.find(ft => ft.id === fm.flightObjectTypeId)?.name })))
const clear = () => editor.value?.clear()
const exportFlightMissions = () => editor.value?.exportFlightMissions();

const importFlightMissions = (e: Event) => {
  const file = (e.target as HTMLInputElement).files![0];
  editor.value?.importFlightMissions(file);
}
const startFlightMissions = () => {
  editor.value?.startFlightMissions(flightObject => {
    flightObject.launch()
    sam?.addFlightObject(flightObject)
  });
}
function addFlightMission() {
  if (points.value.length < 2) return
  editor.value!.addFlightMission();
  resetFlightMission();
}
</script>