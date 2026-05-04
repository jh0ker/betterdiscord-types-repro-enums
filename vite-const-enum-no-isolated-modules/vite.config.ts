import { resolve } from "node:path";
import { defineConfig } from "vite";

// Library mode, single IIFE output — same shape as a BetterDiscord plugin.
// `BdApi` is a free identifier in the bundle; BD provides it at runtime.
export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EnumDemo",
      fileName: () => "EnumDemo.plugin.js",
      formats: ["iife"],
    },
    minify: false,
  },
});
