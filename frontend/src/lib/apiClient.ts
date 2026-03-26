import { client } from "@/client/client.gen";

client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
});

export { client };
