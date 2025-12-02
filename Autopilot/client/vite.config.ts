import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'node:url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: '/',
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@components": path.resolve(__dirname, "src", "components"),
        "@hooks": path.resolve(__dirname, "src", "hooks"),
        "@lib": path.resolve(__dirname, "src", "lib"),
        "@pages": path.resolve(__dirname, "src", "pages"),
        "@assets": path.resolve(__dirname, "src", "assets"),
        "@types": path.resolve(__dirname, "src", "types"),
        "@shared": path.resolve(__dirname, "..", "shared"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 7000,
      allowedHosts: [
        "autopilotx.in",
        "www.autopilotx.in",
        "localhost",
        "127.0.0.1",
      ],
    },
    build: {
      outDir: path.resolve(__dirname, "..", "client-dist"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
      sourcemap: true,
    },
});
