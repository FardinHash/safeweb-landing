import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/content/content.js"),
        background: resolve(__dirname, "src/background/background.js"),
        "content-style": resolve(__dirname, "src/content/content.css"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") return "content.js";
          if (chunkInfo.name === "background") return "background.js";
          return "[name].[hash].js";
        },
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name === "content.css" ||
            assetInfo.name?.includes("content-style")
          ) {
            return "content.css";
          }
          return "assets/[name].[hash].[ext]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
