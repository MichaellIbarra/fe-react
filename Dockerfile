# Multi-stage build para optimizar el tamaño de la imagen final
# Etapa 1: Build de la aplicación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Configurar variables de entorno para optimizar el build
ENV NODE_OPTIONS="--max-old-space-size=8192 --no-warnings"
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true
ENV SKIP_PREFLIGHT_CHECK=true

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Limpiar cache npm antes de instalar
RUN npm cache clean --force

# Instalar todas las dependencias con configuraciones optimizadas
RUN npm ci --legacy-peer-deps --silent --no-audit --no-fund --prefer-offline

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción con configuraciones optimizadas
RUN npm run build

# Limpiar para liberar espacio
RUN npm cache clean --force && \
    rm -rf node_modules && \
    rm -rf /tmp/* && \
    rm -rf ~/.npm

# Etapa 2: Servidor web nginx para servir la aplicación
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Remover la configuración por defecto de nginx
RUN rm -f /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/conf.d/*.conf

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

# No cambiar a usuario no-root para poder usar puerto 80
# USER nginx está configurado en nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
