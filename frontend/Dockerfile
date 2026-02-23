FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY ./frontend/package.json ./frontend/pnpm-lock.yaml /app/frontend/
WORKDIR /app/frontend
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY --from=deps /app/frontend/node_modules /app/frontend/node_modules
COPY ./frontend /app/frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app/frontend
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/frontend/.next /app/frontend/.next
COPY --from=build /app/frontend/public /app/frontend/public
COPY --from=build /app/frontend/package.json /app/frontend/package.json
COPY --from=build /app/frontend/next.config.ts /app/frontend/next.config.ts
COPY --from=build /app/frontend/node_modules /app/frontend/node_modules

EXPOSE 3000
CMD ["pnpm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]