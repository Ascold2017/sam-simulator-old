import "vuetify/styles"; // Global CSS has to be imported
import '@/assets/main.css'
import { createApp } from "vue";
import VueKonva from 'vue-konva';
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import mitt from 'mitt'

import App from "./App.vue";
import Engine from "./SAM/Engine";
import { createPinia } from "pinia";
import type { IEventListenerPayload } from "./SAM/Engine";

const pinia = createPinia();

const bus = mitt();

const eventListener = (name: string, payload: IEventListenerPayload | string) => bus.emit(name, payload)
const engine = new Engine(eventListener);

pinia.use(() => ({ engine }));

const vuetify = createVuetify({
  components,
  theme: {
    defaultTheme: "dark",
  },
});
const app = createApp(App);
app.use(pinia);
app.use(vuetify);
app.use(VueKonva, { prefix: 'vk' })
app.provide('samEventBus', bus)
app.provide('engine', engine)
app.mount("#app");
