FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# recebe variável do yml
ARG VITE_API_URL
# injeta ela no ambiente do node
ENV VITE_API_URL=$VITE_API_URL

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