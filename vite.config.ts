import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools({
      include: ["**/*.png", "**/*.jpg", "**/*.jpeg"],
      defaultDirectives: new URLSearchParams("format=webp&quality=85"),
    }),
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  assetsInclude: [
    "**/*.riv",
    "**/*.woff2",
    "**/*.woff",
    "**/*.otf",
    "**/*.ttf",
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    open: true,
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev"],
  },
});
