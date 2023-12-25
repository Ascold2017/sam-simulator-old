import "vuetify/styles"; // Global CSS has to be imported
import '@/assets/main.css'
import { createApp } from "vue";
import VueKonva from 'vue-konva';
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'

import App from "./App.vue";
import Engine from "./core/Engine/Engine";
import { createPinia } from "pinia";
import { SAM } from "./core/SAM/SAM";

const pinia = createPinia();

const engine = new Engine();
const sam = new SAM(engine);

pinia.use(() => ({ engine, sam }));

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
app.provide('engine', engine)
app.provide('sam', sam);
app.mount("#app");
