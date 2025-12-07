import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async () => {
  const plugins = [
    react(),
    tsconfigPaths({
      root: path.resolve(__dirname),
      projects: [path.resolve(__dirname, "tsconfig.json")],
    }),
    runtimeErrorOverlay(),
  ];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    base: '/',
    plugins,
    css: {
      postcss: {
        plugins: [
          (await import('tailwindcss')).default,
          (await import('autoprefixer')).default,
        ],
      },
    },
    root: path.resolve(__dirname, "client"),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@components": path.resolve(__dirname, "client", "src", "components"),
        "@hooks": path.resolve(__dirname, "client", "src", "hooks"),
        "@lib": path.resolve(__dirname, "client", "src", "lib"),
        "@pages": path.resolve(__dirname, "client", "src", "pages"),
        "@assets": path.resolve(__dirname, "client", "src", "assets"),
        "@types": path.resolve(__dirname, "client", "src", "types"),
        "@shared": path.resolve(__dirname, "shared"),
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
    optimizeDeps: {
      exclude: [
        "@replit/vite-plugin-cartographer",
        "@replit/vite-plugin-runtime-error-modal",
      ],
    },
    build: {
      outDir: path.resolve(__dirname, "client-dist"),
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
  };
});

