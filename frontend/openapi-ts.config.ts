import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../backend/docs/swagger.json",
  output: {
    path: "src/client",
    format: "prettier",
  },
  plugins: ["@hey-api/client-fetch"],
});
