# Multi-stage build para optimizar el tamaño de la imagen final
# Etapa 1: Build de la aplicación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Configurar variables de entorno para optimizar el build
ENV NODE_OPTIONS="--max-old-space-size=6144 --no-warnings"
ENV CI=true
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Copiar archivos de configuración
COPY .env* ./

# Limpiar cache npm antes de instalar
RUN npm cache clean --force

# Instalar todas las dependencias (incluidas dev) para el build con legacy peer deps
RUN npm ci --legacy-peer-deps --silent --no-audit --no-fund --prefer-offline

# Copiar el código fuente
COPY . .

# Verificar que los archivos se copiaron
RUN echo "=== Archivos copiados ===" && \
    ls -la && \
    echo "=== Verificando package.json ===" && \
    grep "homepage" package.json

# Construir la aplicación para producción
RUN npm run build

# Verificar que el build se generó correctamente
RUN echo "=== Verificando build ===" && \
    ls -la build/ && \
    echo "=== Contenido del index.html ===" && \
    head -20 build/index.html

# Limpiar caché y dependencias dev para liberar espacio
RUN npm cache clean --force && \
    rm -rf node_modules && \
    rm -rf /tmp/* && \
    rm -rf /root/.npm

# Etapa 2: Servidor web nginx para servir la aplicación
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Verificar que los archivos se copiaron
RUN echo "=== Archivos en nginx ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Verificando index.html en nginx ===" && \
    head -10 /usr/share/nginx/html/index.html

# Remover la configuración por defecto de nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar configuración de nginx
RUN echo "=== Verificando configuración nginx ===" && \
    ls -la /etc/nginx/conf.d/ && \
    nginx -t

# Exponer el puerto 80
EXPOSE 80

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/school/ || exit 1

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
