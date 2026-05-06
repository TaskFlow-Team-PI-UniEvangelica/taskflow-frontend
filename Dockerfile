FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-bookworm

# remove pagina padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# copia os arquivos do build para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# redirecionamento das rotas
RUN sed -i 's/try_files $uri $uri\/ =404;/try_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]