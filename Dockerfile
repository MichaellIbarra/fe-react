# Multi-stage build para optimizar el tamaño de la imagen final
# Etapa 1: Build de la aplicación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Configurar variables de entorno para optimizar el build
ENV NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Limpiar cache npm antes de instalar
RUN npm cache clean --force

# Instalar todas las dependencias (incluidas dev) para el build con legacy peer deps
RUN npm ci --legacy-peer-deps --silent --no-audit --no-fund

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción con timeout más largo
RUN timeout 300s npm run build || (echo "Build failed or timed out" && exit 1)

# Limpiar caché y dependencias dev para liberar espacio
RUN npm cache clean --force && \
    rm -rf node_modules && \
    rm -rf /tmp/*

# Etapa 2: Servidor web nginx para servir la aplicación
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar los archivos construidos desde la etapa anterior PRIMERO
COPY --from=builder /app/build /usr/share/nginx/html

# Remover la configuración por defecto de nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar que los archivos se copiaron correctamente
RUN ls -la /usr/share/nginx/html/ && \
    ls -la /etc/nginx/conf.d/ && \
    nginx -t

# Exponer el puerto 80
EXPOSE 80

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
