import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@bases": fileURLToPath(
        new URL("./src/components/bases", import.meta.url),
      ),
      "@layouts": fileURLToPath(
        new URL("./src/components/Layouts", import.meta.url),
      ),
      "@mobiles": fileURLToPath(
        new URL("./src/components/mobiles", import.meta.url),
      ),
      "@modals": fileURLToPath(
        new URL("./src/components/modals", import.meta.url),
      ),
      "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
    },
  },
});
