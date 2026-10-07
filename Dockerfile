# Step 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Step 2: Serve the build directory using Nginx
FROM nginx:alpine

RUN apk add --no-cache openssl libcap && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/privkey.pem \
    -out /etc/nginx/certs/fullchain.pem \
    -subj "/CN=*.nip.io"

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions and allow unprivileged nginx binary to bind to low ports
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/certs && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

USER nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

