import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [reactRefresh()],
  base:
    mode === "development"
      ? undefined
      : "https://manu-xo5.github.io/share-easyi/",
  server: {
    proxy:{
      "/api/*": "localhost:5000/*"
    }
  },
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
}));
