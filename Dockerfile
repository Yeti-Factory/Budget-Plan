FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY public ./public
COPY worker ./worker
RUN node scripts/build.mjs && node scripts/test-all.mjs && node scripts/test-server.mjs && node scripts/validate-artifact.mjs

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build --chown=node:node /app/dist/server ./dist/server
COPY --from=build --chown=node:node /app/scripts/server.mjs ./scripts/server.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "scripts/server.mjs"]
