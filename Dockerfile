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

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Copiar archivo de configuración de producción
COPY .env.production ./

# Limpiar cache npm antes de instalar
RUN npm cache clean --force

# Instalar todas las dependencias (incluidas dev) para el build con legacy peer deps
RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción con configuraciones optimizadas
RUN NODE_OPTIONS="--max-old-space-size=8192 --no-warnings --unhandled-rejections=warn" \
    npm run build || (echo "Build failed, trying with reduced memory..." && \
    NODE_OPTIONS="--max-old-space-size=6144 --no-warnings" \
    npm run build)

# Limpiar caché y dependencias dev para liberar espacio inmediatamente después del build
RUN npm cache clean --force && \
    rm -rf node_modules && \
    rm -rf /tmp/* && \
    rm -rf /root/.npm

# Etapa 2: Servidor web nginx para servir la aplicación
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Remover la configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Crear un usuario no-root para ejecutar nginx
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar permisos de los archivos
RUN chown -R nextjs:nodejs /usr/share/nginx/html
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextjs:nodejs /var/run/nginx.pid

# Configurar nginx para correr sin privilegios de root
RUN sed -i '/user nginx;/d' /etc/nginx/nginx.conf && \
    sed -i '/^user/d' /etc/nginx/nginx.conf

# Cambiar a usuario no-root
USER nextjs

# Exponer el puerto 80
EXPOSE 80

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
