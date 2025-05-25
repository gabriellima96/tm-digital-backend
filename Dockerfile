# Dockerfile

# ---- Base Node ----
FROM node:22-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies (PROD) ----
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Development (DEV) ----
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# ---- Build (PROD) ----
FROM development AS build_image
RUN npm run build

# ---- Release (PROD) ----
FROM base AS release
ENV NODE_ENV=production
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build_image /usr/src/app/dist ./dist
COPY package.json .

ENV PORT=3000
EXPOSE ${PORT}
CMD ["node", "dist/main.js"]
