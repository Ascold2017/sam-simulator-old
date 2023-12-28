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
                fill: true ? 'rgb(150, 249, 123)' : 'red',
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
                <SAMButton label="3-P" :x="40" :y="20" name="3P" :value="false" small />
                <SAMButton label="1/2" :x="85" :y="20" name="3P" :value="false" small />
            </vk-group>
            <SAMButton label="LNCH" :x="130" :y="0" name="launchMissile" @click="launchMissile" :value="false"
                color="red" />
            <SAMButton label="RST" :x="195" :y="0" name="resetMissile" @click="resetMissile" :value="false" />
        </vk-group>
</template>

<script setup lang="ts">
import SAMButton from '../SAMButton.vue';
const props = defineProps<{ index: number }>()
function launchMissile() {

}

function resetMissile() {

}
</script>