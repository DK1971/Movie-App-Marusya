import "./assets/styles/normalize.css";
import "./assets/styles/style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/router.ts";
import App from "./App.vue";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);

app.mount("#app");
