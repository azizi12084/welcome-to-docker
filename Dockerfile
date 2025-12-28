# Multi-stage Dockerfile for AziziChat
### Build stage (if you have a frontend build step this can run it) ###
FROM node:18-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
ARG HTTP_PROXY
ARG HTTPS_PROXY
# If a proxy is provided during build, configure npm to use it (optional)
RUN if [ -n "$HTTP_PROXY" ]; then npm config set proxy "$HTTP_PROXY"; fi && \
	if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy "$HTTPS_PROXY"; fi && \
	npm ci
COPY . .
# If you have a build script (e.g., for a frontend) uncomment the next line
# RUN npm run build

### Production stage ###
FROM node:18-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# create non-root user for better security
RUN addgroup -S app && adduser -S -G app app

COPY --from=builder /app/package*.json ./
ARG HTTP_PROXY
ARG HTTPS_PROXY
# honor proxy args for production install as well
RUN if [ -n "$HTTP_PROXY" ]; then npm config set proxy "$HTTP_PROXY"; fi && \
	if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy "$HTTPS_PROXY"; fi && \
	npm ci --only=production
COPY --from=builder /app .
RUN chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node","server.js"]
