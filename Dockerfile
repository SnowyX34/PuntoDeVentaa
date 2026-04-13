# Etapa 1: build Angular
FROM node:20.19.1-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production --project=frontend

# Etapa 2: NGINX
FROM nginx:alpine

# Copiar build Angular
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Opcional: Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto HTTP
EXPOSE 80

# Ejecutar NGINX en primer plano
CMD ["nginx", "-g", "daemon off;"]