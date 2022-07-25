<script lang="ts">
import Bip from '@/classes/Bip';
import Radar from '@/classes/Radar';
import Rocket from '@/classes/Rocket';
export default {
  $refs: {
    radar: HTMLCanvasElement,
    bip: HTMLCanvasElement
  },
  data() {
    return {
      activeTab: 'bip'
    }
  },
  mounted() {
    const radar = new Radar({
      // ts-lint-disable-next-line
      canvasRadar: this.$refs.radar,
      scale: 2,
      rayWidth: 8
    });

    const bip = new Bip({
      canvasBip: this.$refs.bip
    })

    const rocket1 = new Rocket({
      identifier: 'Test1',
      velocity: 3000,
      wayPoints: [{ x: 516, y: 524, z: 0 }, { x: 544, y: 586, z: 9 }, { x: 716, y: 796, z: 13 }, { x: 780, y: 831, z: 0 }],
      visibilityCoefficient: 0.3
    });
    const rocket2 = new Rocket({
      identifier: 'Test2',
      velocity: 1200,
      wayPoints: [{ x: 768, y: 688, z: 0 }, { x: 722, y: 648, z: 21 }, { x: 506, y: 598, z: 35 }, { x: 468, y: 605, z: 0 }],
      visibilityCoefficient: 0.01
    })
    bip.addRocket(rocket1);
    bip.addRocket(rocket2);
    radar.addRocket(rocket1.launch());
    radar.addRocket(rocket2.launch());
  },
  methods: {
    exportCoordinates(e: MouseEvent) {
      console.log(e.x, e.y)
    }
  }
}
</script>

<template>
  <main>
    <div class="tabs">
      <div class="tab" :class="{ active: activeTab === 'bip' }" @click="activeTab = 'bip'">БИП</div>
      <div class="tab" :class="{ active: activeTab === 'soc' }" @click="activeTab = 'soc'">СОЦ</div>
      <div class="tab" :class="{ active: activeTab === 'snr' }" @click="activeTab = 'snr'">СНР</div>
    </div>
    <canvas v-show="activeTab === 'bip'" ref="bip" width="1000" height="1000"
      style="background-image: url(/snazzy-image.png); background-size: contain;" @click="exportCoordinates"></canvas>
    <canvas v-show="activeTab === 'soc'" ref="radar" width=650 height=650></canvas>
  </main>
</template>

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
</style>