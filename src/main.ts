import "vuetify/styles"; // Global CSS has to be imported
import '@/assets/main.css'
import { createApp } from "vue";
import VueKonva from 'vue-konva';
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import mitt from 'mitt'

import App from "./App.vue";
import SAM from "./classes/SAM";

const bus = mitt();
(window as any).__ACCELERATION__ = 1;

const vuetify = createVuetify({
  components,
  theme: {
    defaultTheme: "dark",
  },
});
const app = createApp(App);
app.use(vuetify);
app.use(VueKonva)
app.provide('samEventBus', bus)
app.provide('sam', new SAM((e: any) => bus.emit('update', e)))
app.mount("#app");
