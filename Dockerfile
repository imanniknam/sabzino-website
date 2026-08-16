FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    CI=1 \
    WRANGLER_SEND_METRICS=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && chmod +x deploy/start.sh

EXPOSE 3000
VOLUME ["/data"]

CMD ["./deploy/start.sh"]

