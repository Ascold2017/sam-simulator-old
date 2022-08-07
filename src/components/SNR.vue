<template>
  <v-container fluid class="px-6">
    <!-- MIDDLE PANEL -->
    <div class="mx-auto">
      <v-row align="start">
        <v-col cols="3">

          <v-card class="px-3 py-3">

            <div class="mb-3">
              <span class="v-label" style="width: 70px">Питание</span>
              <v-icon :color="params.isEnabled ? 'success' : 'warning'" class="mx-3">mdi-checkbox-blank-circle
              </v-icon>
              <v-btn-toggle density="compact" :model-value="params.isEnabled" @update:model-value="setIsEnabled" divided
                mandatory variant="outlined">
                <v-btn size="x-small" :value="true">Вкл</v-btn>
                <v-btn size="x-small" :value="false">Выкл</v-btn>
              </v-btn-toggle>
            </div>
            <div class="mb-3">
              <span class="v-label" style="width: 70px">COЦ</span>
              <v-icon :color="params.isEnabledSOC ? 'success' : 'warning'" class="mx-3">mdi-checkbox-blank-circle
              </v-icon>
              <v-btn-toggle density="compact" :disabled="!params.isEnabled" mandatory :model-value="params.isEnabledSOC"
                @update:model-value="setIsEnabledSOC" divided variant="outlined">
                <v-btn size="x-small" :value="true">Вкл</v-btn>
                <v-btn size="x-small" :value="false">Выкл</v-btn>
              </v-btn-toggle>
            </div>
            <v-radio-group density="compact" inline label="Режим дальности, км" :model-value="distanceScale"
              @update:model-value="setDistanceScale" hide-details>
              <v-radio :value="1" label="100"></v-radio>
              <v-radio :value="0.5" label="50"></v-radio>
              <v-radio :value="0.3" label="30"></v-radio>
            </v-radio-group>
            <v-radio-group density="compact" inline small label="Усиление" :model-value="gain"
              @update:model-value="setGain" hide-details>
              <v-radio :value="1" label="1"></v-radio>
              <v-radio :value="2" label="2"></v-radio>
              <v-radio :value="3" label="3"></v-radio>
            </v-radio-group>
             <v-radio-group label="Отображение" density="compact" small inline v-model="viewMode" hide-details>
              <v-radio value="bip" label="БИП"></v-radio>
              <v-radio value="radar" label="РЛС"></v-radio>
            </v-radio-group>
          </v-card>
        </v-col>

        <!-- MAIN INDICATOR -->
        <v-col cols="6" style="position: relative;">
          <v-card class="py-3 px-3 mb-3">
           
            <canvas v-show="viewMode === 'bip'" ref="bipRef" width="1000" height="1000" class="map-image border"
              style="background-size: contain; display: block; max-width: 100%;"></canvas>
            <div style="position: relative" v-show="viewMode === 'radar'">
              <canvas ref="radarRef" width=850 height=850 class="mx-auto mb-3"
                style="display: block; max-width: 100%;"></canvas>
            </div>
          </v-card>
        </v-col>

        <v-col cols="3">
          <v-card class="px-3 py-3">
            <div>
              <v-table density="compact">
                <thead>
                  <th class="text-left pl-4">ID</th>
                  <th class="text-left pl-4">Д, км</th>
                  <th class="text-left pl-4">P, км</th>
                  <th class="text-left pl-4">H, км</th>
                  <th class="text-left pl-4">V, км</th>
                  <th class="text-left pl-4">Выбор</th>
                </thead>
                <tbody>
                  <tr v-for="capturedTarget in params.capturedTargets">
                    <td>{{ capturedTarget.number }}</td>
                    <td>{{ capturedTarget.distance }}</td>
                    <td>{{ capturedTarget.param }}</td>
                    <td>{{ capturedTarget.height }}</td>
                    <td>{{ capturedTarget.velocity }}</td>
                    <td>{{ capturedTarget.radialVelocity }}</td>
                    <td>
                      <v-radio v-show="capturedTarget.identifier" :value="capturedTarget.identifier"
                        v-model="targetToFire" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="flex-grow-0">
                <v-row class="mx-0 mb-6">
                  <v-col cols="4" v-for="(launcher, i) in launchers"
                    class="d-flex flex-column align-center text-center">
                    <span>ПУ-{{ launcher.id }}</span>
                    <v-radio :value="launcher.id" v-model="selectedLauncher" />

                    <v-icon :color="missile.isLaunched || !params.isEnabled ? 'warning' : 'success'"
                      v-for="missile in launcher.missiles">
                      mdi-checkbox-blank-circle</v-icon>
                  </v-col>
                </v-row>
                <v-btn block color="error" @click="launchMissile" :disabled="!targetToFire">Пуск</v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import SAMissile from '@/classes/SAMissile';
import Bip from "@/classes/Bip";
import SAM from '@/classes/SAM';
import { onMounted, ref, reactive, computed } from 'vue';
import type FlightObject from '@/classes/FlightObject';
import Sounds from '@/classes/Sounds.js';
interface IParams {
  capturedTargets: any[];
  isEnabled: boolean;
  isEnabledSOC: boolean
}
interface IMissileParams {
  id: number;
  isLaunched: boolean;
  velocity: number;
  maxDistance: number;
  initialPoint: { x: number; y: number; z: number; }
}
const initialParams = {
  initialScale: 1,
  initialDistance: 30,
  maxDistance: 100,
  minVerticalAngle: -5,
  maxVerticalAngle: 75,
  missileVelocity: 900,
  missileMaxDistance: 25,
  distanceDetectRange: 1,
  azimutDetectRange: 1,
  initialRayWidth: 16,
}
const bipRef = ref<HTMLCanvasElement | null>(null);
const radarRef = ref<HTMLCanvasElement | null>(null);
const sam = ref<SAM | null>(null);
const bip = ref<Bip | null>(null);

const viewMode = ref<string>('bip')
const targetToFire = ref<string | null>(null);
const selectedLauncher = ref<number>(1);
const params = reactive<IParams>({
  capturedTargets: Array(12).fill(0).map((_, i) => ({
    identifier: null,
    number: '--',
    distance: '--.-',
    height: '--.-',
    velocity: '---',
    radialVelocity: '---',
    param: '--.--'
  })),
  isEnabled: false,
  isEnabledSOC: false
});

const launchers = ref([
  {
    id: 1,
    missiles: Array(4)
      .fill(0)
      .map((_, i) => ({
        id: i,
        isLaunched: false,
        velocity: 900,
        maxDistance: 25,
        initialPoint: { x: 2, y: 0, z: 0.03 }
      }))
  },
  {
    id: 2,
    missiles: Array(4)
      .fill(0)
      .map((_, i) => ({
        id: i,
        isLaunched: false,
        velocity: 900,
        maxDistance: 25,
        initialPoint: { x: -2, y: 0, z: 0.03 }
      }))
  },
  {
    id: 3,
    missiles: Array(4)
      .fill(0)
      .map((_, i) => ({
        id: i,
        isLaunched: false,
        velocity: 900,
        maxDistance: 25,
        initialPoint: { x: 2, y: 2, z: 0.03 }
      }))
  },
]);


let distanceScale = computed(() => sam.value?.distanceScale);
const gain = computed(() => sam.value?.gain)

const setDistanceScale = (v: number) => sam.value?.setDistanceScale(v);
const setGain = (v: number) => sam.value?.setGain(v)

const setIsEnabled = (value: boolean) => sam.value?.setIsEnabled(value)

const setIsEnabledSOC = (value: boolean) => sam.value?.setIsEnabledSOC(value)

const refillCapturedTargets = (capturedTargets: any[]) => {
  params.capturedTargets = [...capturedTargets].concat(Array(12 - capturedTargets.length).fill(0).map((_, i) => ({
    identifier: null,
    number: '--',
    distance: '--.-',
    height: '--.-',
    velocity: '---',
    radialVelocity: '---',
    param: '--.--'
  })))
}


function SNRListener(property: string, value: number | boolean | any[]) {
  property === 'capturedTargets' && refillCapturedTargets(params.capturedTargets = value as any[])
  property === 'isEnabled' && (params.isEnabled = value as boolean)
  property === 'isEnabledSOC' && (params.isEnabledSOC = value as boolean)
}

function launchMissile() {
  const launcher = launchers.value.find(l => l.id === selectedLauncher.value)!
  const missileParams = launcher.missiles.find(m => !m.isLaunched);
  console.log(missileParams)
  if (!missileParams) return;

  const missile = new SAMissile(sam.value!.getTracketTarget(targetToFire.value!), missileParams.maxDistance, missileParams.velocity, missileParams.initialPoint)
  missile.launch();
  launcher.missiles = launcher.missiles.map(m => m.id === missileParams.id ? { ...m, isLaunched: true } : m)
  sam.value!.addMissile(missile);
  Sounds.click();


}

function addFlightObject(flightObject: FlightObject) {
  sam.value?.addFlightObject(flightObject);
  bip.value?.addFlightObject(flightObject);
}

onMounted(() => {
  bip.value = new Bip({
    canvasBip: bipRef.value!
  });
  sam.value = new SAM({
    mainScreenCanvas: radarRef.value!,
    eventListener: SNRListener,
    distanceDetectRange: initialParams.distanceDetectRange,
    azimutDetectRange: initialParams.azimutDetectRange,
    initialDistance: initialParams.initialDistance,
    initialRayWidth: initialParams.initialRayWidth,
    maxDistance: initialParams.maxDistance,
    missileVelocity: initialParams.missileVelocity,
    minVerticalAngle: initialParams.minVerticalAngle,
    maxVerticalAngle: initialParams.maxVerticalAngle,
    scale: initialParams.initialScale
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      'KeyA': () => sam.value?.setAzimut(sam.value.azimutDeg - 0.5),
      'KeyD': () => sam.value?.setAzimut(sam.value.azimutDeg + 0.5),
      'KeyW': () => sam.value?.setIndicatorTargetDistance(sam.value.indicatorTargetDistance + 0.4),
      'KeyS': () => sam.value?.setIndicatorTargetDistance(sam.value.indicatorTargetDistance - 0.4),
      'Space': () => sam.value?.captureTarget()
    }
    map[event.code] && map[event.code]();
  }, false)
});

defineExpose({
  addFlightObject
})
</script>