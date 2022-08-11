import "vuetify/styles"; // Global CSS has to be imported
import '@/assets/main.css'
import { createApp } from "vue";
import VueKonva from 'vue-konva';
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import mitt from 'mitt'

import App from "./App.vue";
import SAM, { type IEventListenerPayload } from "./classes/SAM";
import { createPinia } from "pinia";

const pinia = createPinia();

const bus = mitt();
const sam = new SAM((eventName: string, eventPayload: IEventListenerPayload | string) => bus.emit(eventName, eventPayload));

pinia.use(() => ({ sam }));

(window as any).__ACCELERATION__ = 1;

const vuetify = createVuetify({
  components,
  theme: {
    defaultTheme: "dark",
  },
});
const app = createApp(App);
app.use(pinia);
app.use(vuetify);
app.use(VueKonva)
app.provide('samEventBus', bus)
app.provide('sam', sam)
app.mount("#app");
