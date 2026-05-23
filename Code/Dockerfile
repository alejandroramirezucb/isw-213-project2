FROM node:20-alpine AS constructor
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS produccion
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=constructor /app/dist ./dist
COPY --from=constructor /app/src/servidor ./src/servidor
COPY --from=constructor /app/index.js ./index.js

EXPOSE 3000
CMD ["node", "index.js"]
