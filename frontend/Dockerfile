# ── Stage 1: Build Angular ──────────────────────────────────
FROM node:20.11.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm ci --only=development
COPY . .
RUN npm run build:prod

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=build /app/dist/devpulse-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
