<template>
<vk-group :config="{ x: 0, y: index * 70 + 70 }">
            <vk-text :config="{
                x: 0, y: 0,
                text: 'CHNL ' + (index + 1),
                fill: '#181818',
                fontFamily: 'DS-DigitalB',
                fontSize: 13,
                align: 'center',
            }" />
            <vk-circle :config="{
                name: 'missileAvailable',
                x: 10,
                y: 40,
                width: 20,
                height: 20,
                fill: (!missileChannel.missile) ? 'rgb(150, 249, 123)' : 'red',
                shadowBlur: 5
            }" />
            <vk-group>
                <vk-text :config="{
                    x: 40, y: 2,
                    text: 'GUIDANCE',
                    fill: '#181818',
                    fontFamily: 'DS-DigitalB',
                    fontSize: 13,
                    align: 'center',
                    width: 80
                }" />
                <SAMButton label="3-P" :x="40" :y="20" name="3P" :value="guidanceMethod === '3P'" @click="selectMethod('3P')" small />
                <SAMButton label="1/2" :x="85" :y="20" name="1/2" :value="guidanceMethod === '1/2'" @click="selectMethod('1/2')" small />
            </vk-group>
            <SAMButton label="LNCH" :x="130" :y="0" name="launchMissile" @click="launchMissile" :value="false"
                color="red" />
            <SAMButton label="RST" :x="195" :y="0" name="resetMissile" @click="resetMissile" :value="false" />
        </vk-group>
</template>

<script setup lang="ts">
import SAMButton from '../SAMButton.vue';
import { useMainStore } from '@/store/main';
import { ref } from 'vue';
const props = defineProps<{ index: number; missileChannel: any }>();

const mainStore = useMainStore();
const guidanceMethod = ref<'3P' | '1/2'>('3P');
function launchMissile() {
    // const target = sam!.getRadarObjects().filter(fo => fo instanceof DetectedRadarObject)[mainStore.currentTargetIndex];
    // sam?.launchMissile(target.id, props.index, guidanceMethod.value);
}

function resetMissile() {
    // sam?.resetMissile(props.index);
}

function selectMethod(method: '3P' | '1/2') {
    if (!props.missileChannel.missile) {
        guidanceMethod.value = method;
    }
}

</script>