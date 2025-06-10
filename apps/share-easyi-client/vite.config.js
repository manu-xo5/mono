import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import solidPlugin from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(
  /** @type {import("vite").UserConfig} */
  {
    plugins: [
      TanStackRouterVite({ target: 'solid', autoCodeSplitting: true }),
      solidPlugin(),
      tailwindcss(),
      nodePolyfills({
        include: ['crypto', 'buffer', 'stream', 'util'],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  },
)
