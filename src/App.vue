<template>
  <main>
    <div class="tabs">
      <div class="tab" :class="{ active: activeTab === 'bip' }" @click="activeTab = 'bip'">БИП</div>
      <div class="tab" :class="{ active: activeTab === 'soc' }" @click="activeTab = 'soc'">СОЦ</div>
      <div class="tab" :class="{ active: activeTab === 'snr' }" @click="activeTab = 'snr'">СНР</div>
      <div class="tab" :class="{ active: activeTab === 'editor' }" @click="activeTab = 'editor'">Редактор</div>
    </div>
    <canvas v-show="activeTab === 'bip'" ref="bip" width="1000" height="1000"
      style="background-image: url(/snazzy-image.png); background-size: contain;"></canvas>
    <canvas v-show="activeTab === 'soc'" ref="radar" width=650 height=650></canvas>
    <div class="editor">
      <canvas v-show="activeTab === 'editor'" ref="editor" width="1000" height="1000"
        style="background-image: url(/snazzy-image.png); background-size: contain;" @click="exportCoordinates"></canvas>
      <div class="editor-form" v-show="activeTab === 'editor'">
        <label><input type="number" placeholder="Высота полета на марше, km" v-model="altitude" /><span>Высота полета на
            марше, km</span></label>
        <label><input type="number" placeholder="Скорость полета, м/с" v-model="velocity" /><span>Скорость полета,
            м/с</span></label>
        <label><input type="number" placeholder="Коэффициент заметности" min="0.1" max="1"
            v-model="visibilityCoefficient" /><span>Коэффициент заметности</span></label>

        <ul>
          <li v-for="point in points">{{ point.x }}, {{ point.y }}</li>
        </ul>
        <div style="display: flex;">
          <button type="button" @click="resetPoints">Очистить</button>
          <button type="button" @click="addRocket">Запустить
            ракету</button>
        </div>

      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Bip from '@/classes/Bip';
import Radar from '@/classes/Radar';
import Rocket from '@/classes/Rocket';

interface IData {
  activeTab: string;
  points: { x: number; y: number; z: number }[];
  altitude: number;
  velocity: number;
  radar: Radar | null;
  bip: Bip | null;
  visibilityCoefficient: number;
}
export default defineComponent({
  $refs: {
    radar: HTMLCanvasElement,
    bip: HTMLCanvasElement,
    editor: HTMLCanvasElement
  },
  data(): IData {
    return {
      activeTab: 'bip',
      points: [],
      altitude: 12,
      velocity: 280,
      radar: null,
      visibilityCoefficient: 0.5,
      bip: null,
    }
  },
  mounted() {
    this.radar = new Radar({
      // ts-lint-disable-next-line
      canvasRadar: this.$refs.radar,
      scale: 2,
      rayWidth: 8
    });

    this.bip = new Bip({
      canvasBip: this.$refs.bip
    })
  },
  methods: {
    exportCoordinates(e: MouseEvent) {
      if (this.points.length >= 4) return;
      const currentPoint = { x: e.offsetX, y: e.offsetY, z: 0 };
      this.points.push(currentPoint);
      const ctx = (this.$refs.editor as HTMLCanvasElement).getContext('2d')!;
      const prevPoint = this.points.length > 1 ? this.points[this.points.length - 2] : this.points[0];
      ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.fillText(this.points.length.toString(), currentPoint.x, currentPoint.y)
      ctx.stroke();
    },
    resetPoints() {
      this.points = [];
      const ctx = (this.$refs.editor as HTMLCanvasElement).getContext('2d')!;
      ctx.clearRect(0, 0, 1000, 1000);
      this.velocity = 280;
      this.altitude = 12;
      this.visibilityCoefficient = 0.5;
    },
    addRocket() {
      if (this.points.length !== 4) return
      const wayPoints = [...this.points];
      wayPoints[1].z = this.altitude;
      wayPoints[2].z = this.altitude;
      const rocket = new Rocket({
        identifier: new Date().toString(),
        velocity: this.velocity,
        wayPoints: wayPoints,
        visibilityCoefficient: this.visibilityCoefficient
      });
      this.bip?.addRocket(rocket);
      this.radar?.addRocket(rocket);
      rocket.launch();
      this.resetPoints();
    }
  }
})
</script>



<style>
.tabs {
  display: flex;
}

.tab {
  border: 1px solid grey;
  padding: 5px 15px;
  cursor: pointer;
}

.tab.active {
  color: darkgoldenrod;
}

.editor {
  display: flex;
}

.editor-form {}
</style>