<template>
  <v-layout full-height>
    <v-main dark>
      <v-tabs v-model="activeScreen">
        <v-tab value="BIP">БИП</v-tab>
        <v-tab value="SOC">СОЦ</v-tab>
        <v-tab value="SNR">СНР</v-tab>
        <v-tab value="Editor">Редактор</v-tab>
      </v-tabs>

      <v-card v-show="activeScreen === 'BIP'" theme="dark" :transition="false">
        <v-row>
          <v-col>
            <canvas ref="bip" width="1000" height="1000"
              style="background-image: url(/snazzy-image.png); background-size: contain; width: 100%; height: auto; display: block;"></canvas>
          </v-col>
          <v-divider vertical />
          <v-col>
            <v-card>
              <ul>
                <li v-for="message in messages">{{ message }}</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>

      </v-card>
      <v-card v-show="activeScreen === 'SOC'">
        <v-row>
          <v-col>
            <canvas ref="radar" width=650 height=650 style=" width: 100%; height: auto; display: block;"></canvas>
          </v-col>
          <v-divider vertical />
          <v-col>
            <v-radio-group v-model="socScale">
              <v-radio label="150 km" :value="2" />
              <v-radio label="100 km" :value="3" />
              <v-radio label="50 km" :value="6" />
            </v-radio-group>
          </v-col>
        </v-row>
      </v-card>
      <v-card v-show="activeScreen === 'SNR'">
      </v-card>
      <v-card v-show="activeScreen === 'Editor'">
        <v-row>
          <v-col cols="6">
            <div style="overflow: auto; height: 768px;">
              <canvas ref="editor" width="1000" height="1000"
                style="background-image: url(/snazzy-image.png); background-size: contain;"
                @click="exportCoordinates"></canvas>
            </div>
          </v-col>
          <v-col cols="6">
            <v-card>
              <v-card-text>
                <h3 class="mb-3">Нанесите 4 точки полета и задайте параметры ракеты</h3>
                <v-text-field label="Высота полета на марше, km" v-model="altitude" />
                <v-text-field label="Скорость полета,
                м/с" v-model="velocity" />
                <v-text-field label="Коэффициент заметности" v-model="visibilityCoefficient" />
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
    </v-main>
  </v-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Bip from '@/classes/Bip';
import Radar from '@/classes/Radar';
import Editor from '@/classes/Editor';
enum ScreensEnum {
  BIP = 'BIP',
  SOC = 'SOC',
  SNR = 'SNR',
  Editor = 'Editor'
}
interface IData {
  activeScreen: ScreensEnum;
  radar: Radar | null;
  bip: Bip | null;
  editor: Editor | null;
}
export default defineComponent({
  $refs: {
    radar: HTMLCanvasElement,
    bip: HTMLCanvasElement,
    editor: HTMLCanvasElement
  },
  data(): IData {
    return {
      activeScreen: ScreensEnum.Editor,
      radar: null,
      bip: null,
      editor: null,
    }
  },
  async mounted() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const keymap: Record<string, ScreensEnum> = {
        'KeyA': ScreensEnum.BIP,
        'KeyS': ScreensEnum.SOC,
        'KeyD': ScreensEnum.SNR,
        'KeyQ': ScreensEnum.Editor
      }

      if (e.code in keymap) {
        this.activeScreen = keymap[e.code];
      }
    })
    this.radar = new Radar({
      // ts-lint-disable-next-line
      canvasRadar: this.$refs.radar,
      rayWidth: 8
    });

    this.bip = new Bip({
      canvasBip: (this.$refs.bip as HTMLCanvasElement)
    });

    this.editor = new Editor(this.$refs.editor as HTMLCanvasElement);
  },

  computed: {
    messages() {
      return this.bip?.messages || [];
    },
    velocity: {
      get() {
        return this.editor?.velocity || 0;
      },
      set(v: number) {
        this.editor!.velocity = v;
      }
    },
    altitude: {
      get() {
        return this.editor?.altitude || 0;
      },
      set(v: number) {
        this.editor!.altitude = v;
      }
    },
    visibilityCoefficient: {
      get() {
        return this.editor?.visibilityCoefficient || 0;
      },
      set(v: number) {
        this.editor!.visibilityCoefficient = v;
      }
    },
    points() {
      return this.editor?.points || [];
    },
    flightParams() {
      return this.editor?.flightParams || { range: 0, time: 0 };
    },
    socScale: {
      get() {
        return this.radar?.scale
      },
      set(v: number) {
        this.radar!.scale = v;
      }
    }
  },
  methods: {
    exportCoordinates(e: MouseEvent) {
      this.editor!.addPoint(e);
    },
    resetPoints() {
      this.editor!.reset();
    },
    addFlightObject() {
      if (this.points.length !== 4) return
      const flightObject = this.editor!.addFlightObject();
      this.bip?.addFlightObject(flightObject);
      this.radar?.addFlightObject(flightObject);
      flightObject.launch(msg => this.bip!.listener(msg))

    },
  }
})
</script>