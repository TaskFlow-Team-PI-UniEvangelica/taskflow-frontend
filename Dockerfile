# Build SPA usando a plataforma nativa do runner ($BUILDPLATFORM)
FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_KEYCLOAK_AUTHORITY
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_REDIRECT_URI

ENV VITE_API_URL=$VITE_API_URL \
    VITE_KEYCLOAK_AUTHORITY=$VITE_KEYCLOAK_AUTHORITY \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID \
    VITE_REDIRECT_URI=$VITE_REDIRECT_URI

RUN npm run build

# Nginx unprivileged (executa sem permissão de root na porta 8080)
FROM nginxinc/nginx-unprivileged:1.27-alpine
ARG VITE_API_URL
ARG VITE_KEYCLOAK_AUTHORITY

COPY nginx/default.conf.template /tmp/default.conf.template

USER root
# Preenche as origens da API e Keycloak na CSP de forma dinâmica
RUN API_ORIGIN="$(echo "$VITE_API_URL" | sed -E 's#^(https?://[^/]+).*#\1#')" \
    AUTH_ORIGIN="$(echo "$VITE_KEYCLOAK_AUTHORITY" | sed -E 's#^(https?://[^/]+).*#\1#')" \
    envsubst '${API_ORIGIN} ${AUTH_ORIGIN}' < /tmp/default.conf.template > /etc/nginx/conf.d/default.conf \
 && rm /tmp/default.conf.template

USER 101
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
