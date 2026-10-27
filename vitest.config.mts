import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Resolve the "@/..." import alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    // Server code runs in Node; component/hook tests opt into jsdom per file.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
});
