FROM node:20-alpine AS builder

WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/ .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'export PORT=${PORT:-80}' >> /start.sh && \
    echo 'export BACKEND_URL=${BACKEND_URL:-http://backend:8000}' >> /start.sh && \
    echo 'echo "Starting nginx with PORT: $PORT and BACKEND_URL: $BACKEND_URL"' >> /start.sh && \
    echo 'envsubst '"'"'$PORT,$BACKEND_URL'"'"' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]