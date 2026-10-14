import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // Relative asset URLs so the build works under the GitHub Pages subpath
  // (/kanbone/). Routing is hash-based, so there are no nested paths to break this.
  base: "./",
  plugins: [
    mode === "analyze" &&
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
}));
