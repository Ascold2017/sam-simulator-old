<template>
  <v-container class="mb-6">
    <v-row justify="center" align="start">
      <v-col class="d-flex justify-center" cols="6">
        <canvas ref="editorRef" width="600" height="600" class="border mx-auto"
          style="background-size: 100%; background-position: center;" @click="exportCoordinates"></canvas>
      </v-col>
      <v-col class="d-flex justify-center" cols="6">
        <v-card width="800">
          <v-card-text>
            <h3 class="mb-3">Put flight point and set target params</h3>
            <v-select label="Flight object type" :items="FLIGHT_OBJECT_TYPES" item-title="name" item-value="id"
              :model-value="flightObjectType" @update:model-value="setFlightObjectType" />
            <v-text-field label="Starting for, s" :model-value="timeOffset" @update:model-value="setTimeOffset" />
            <h4>Way | Flight distance: {{ flightParams.range }} km | Flight time: {{ flightParams.time }} min
            </h4>
            <v-table density="compact" class="mb-3">
              <thead>
                <tr>
                  <td>X</td>
                  <td>Y</td>
                  <td>Altitude, m</td>
                  <td>Velocity, m/s</td>
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
              <v-btn @click="addFlightMission" :disabled="points.length < 2" color="success">Add flight mission
              </v-btn>
              <v-btn @click="resetFlightMission" color="warning">Reset</v-btn>
            </div>
            <v-divider class="mb-3" />
            <h4>Flight missions</h4>
            <v-table density="compact" class="mb-3">
              <thead>
                <tr>
                  <td>Flight object type</td>
                  <td>Starting for, s</td>
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
              <v-btn @click="clear" color="error">Reset all</v-btn>
              <v-btn @click="exportFlightMissions">Download <v-icon>mdi-download</v-icon>
              </v-btn>
            </div>

            <v-file-input label="Mission file" class="mb-3" hide-details append-icon="mdi-upload"
              @change="importFlightMissions"></v-file-input>

            <v-btn @click="startFlightMissions" block color="error">LAUNCH!</v-btn>
          </v-card-text>


        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import FLIGHT_OBJECT_TYPES from '@/const/FLIGHT_OBJECT_TYPES';
import Editor from '@/components/Editor/Editor';
import { onMounted, ref, inject, computed } from 'vue';

const editorRef = ref<HTMLCanvasElement | null>(null);

const editor = ref<Editor | null>(null);
onMounted(() => {
  editor.value = new Editor(editorRef.value!);
})

const flightObjectType = ref<number | null>(null);
const flightObjectMaxVelocity = ref<number>(100);

const setFlightObjectType = (value: number) => {
  const foType = FLIGHT_OBJECT_TYPES.find(fo => fo.id === value)!
  flightObjectType.value = value;
  editor.value!.setFlightObjectType(value);
  flightObjectMaxVelocity.value = foType.maxVelocity;
}

const timeOffset = computed(() => editor.value?.getTimeOffset());
const setTimeOffset = (v: string) => editor.value!.setTimeOffset(+v);

const exportCoordinates = (e: MouseEvent) => {
  if (!flightObjectType.value) return;
  editor.value?.addPoint(e)
}

const setPointParam = (index: number, paramName: string, paramValue: string) => editor.value?.setParamAtPoint(index, paramName, Number(paramValue));
const points = computed(() => editor.value?.getPoints() || []);
const flightParams = computed(() => editor.value?.getFlightParams() || { time: 0, range: 0 })

const resetFlightMission = () => {
  editor.value?.reset()
  setTimeOffset('0');
  flightObjectType.value = null;
}

const flightObjectMissions = computed(() => (editor.value?.getFlightObjectMissions() || []).map(fm => ({ ...fm, flightObjectType: Editor.flightObjectTypes.find(ft => ft.id === fm.flightObjectTypeId)?.name })))
const clear = () => editor.value?.clear()
const exportFlightMissions = () => editor.value?.exportFlightMissions();

const importFlightMissions = (e: Event) => {
  const file = (e.target as HTMLInputElement).files![0];
  editor.value?.importFlightMissions(file);
}
const startFlightMissions = () => {
  // engine?.startMission(editor.value!.getFlightMissions())
}
function addFlightMission() {
  if (points.value.length < 2) return
  editor.value!.addFlightMission();
  resetFlightMission();
}
</script>