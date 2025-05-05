FROM node:23-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build


FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
