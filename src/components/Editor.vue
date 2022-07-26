<template>
  <v-card>
    <v-row>
      <v-col cols="6">
        <div style="overflow: auto; height: 768px;">
          <canvas ref="editorRef" width="1000" height="1000"
            style="background-image: url(/snazzy-image.png); background-size: contain;"
            @click="exportCoordinates"></canvas>
        </div>
      </v-col>
      <v-col cols="6">
        <v-card>
          <v-card-text>
            <h3 class="mb-3">Нанесите 4 точки полета и задайте параметры ракеты</h3>
            <v-text-field label="Высота полета на марше, km" :model-value="altitude"
              @update:model-value="setAltitude" />
            <v-text-field label="Скорость полета,
                м/с" :model-value="velocity" @update:model-value="setVelocity" />
            <v-text-field label="Коэффициент заметности" :model-value="visibilityCoefficient"
              @update:model-value="setVisibilityCoefficient" />
            <h5>Координаты</h5>
            <ul class="pl-3">
              <li v-for="point in points">{{ point.x }}, {{ point.y }}</li>
            </ul>

            <div>
              Дальность полета: {{ flightParams.range }} км
            </div>
            <div>
              Полетное время: {{ flightParams.time }} мин
            </div>

          </v-card-text>
          <v-card-actions>
            <v-btn @click="resetPoints">Очистить</v-btn>
            <v-btn @click="addFlightObject" :disabled="points.length < 4">Запустить
              ракету</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import Editor from '@/classes/Editor';
import type FlightObject from '@/classes/FlightObject';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
const emit = defineEmits<{ (e: 'addFlightObject', flightObject: FlightObject): void }>()
const editorRef = ref<HTMLCanvasElement | null>(null);
const editor = ref<Editor | null>(null);

const exportCoordinates = (e: MouseEvent) => {
  editor.value?.addPoint(e)
}
onMounted(() => {
  editor.value = new Editor(editorRef.value!);
})

const altitude = computed(() => {
  return editor.value?.altitude;
})
const setAltitude = (v: string) => editor.value!.altitude = v as unknown as number

const velocity = computed(() => {
  return editor.value?.velocity;
})
const setVelocity = (v: string) => editor.value!.velocity = v as unknown as number

const visibilityCoefficient = computed(() => editor.value?.visibilityCoefficient);
const setVisibilityCoefficient = (v: string) => editor.value!.visibilityCoefficient = v as unknown as number

const points = computed(() => editor.value?.points || []);

const flightParams = computed(() => editor.value?.flightParams || { time: 0, range: 0 })

function resetPoints() {
  editor.value!.reset()
}

function addFlightObject() {
  if (points.value.length !== 4) return
  const flightObject = editor.value!.addFlightObject();
  emit('addFlightObject', flightObject)
}
</script>