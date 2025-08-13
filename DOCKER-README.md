# EduAssist Frontend - Docker Deployment

Este documento explica cómo construir y desplegar la aplicación frontend de EduAssist usando Docker.

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado
- Docker Compose (incluido en Docker Desktop)

### Comandos Rápidos

#### En Windows (PowerShell):
```powershell
# Construir y ejecutar
.\docker.ps1 run

# Ver logs
.\docker.ps1 logs

# Detener
.\docker.ps1 stop
```

#### En Linux/macOS (Bash):
```bash
# Dar permisos de ejecución
chmod +x docker.sh

# Construir y ejecutar
./docker.sh run

# Ver logs
./docker.sh logs

# Detener
./docker.sh stop
```

#### Usando Docker Compose:
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 📁 Archivos de Configuración

### Dockerfile
- **Multi-stage build** para optimizar el tamaño
- **Etapa 1**: Build de la aplicación React
- **Etapa 2**: Servidor nginx optimizado
- **Usuario no-root** para mayor seguridad
- **Health checks** incluidos

### nginx.conf
- Configuración optimizada para aplicaciones React SPA
- Soporte para React Router
- Compresión gzip habilitada
- Headers de seguridad
- Cache optimizado para assets estáticos

### .dockerignore
- Excluye archivos innecesarios del contexto de build
- Reduce el tamaño de la imagen final

## 🛠️ Comandos Disponibles

### Scripts de Automatización

#### docker.ps1 (Windows PowerShell)
```powershell
.\docker.ps1 build    # Solo construir la imagen
.\docker.ps1 run      # Construir y ejecutar
.\docker.ps1 stop     # Detener contenedor
.\docker.ps1 clean    # Limpiar imágenes y contenedores
.\docker.ps1 logs     # Ver logs en tiempo real
.\docker.ps1 shell    # Abrir shell en el contenedor
.\docker.ps1 help     # Mostrar ayuda
```

#### docker.sh (Linux/macOS Bash)
```bash
./docker.sh build    # Solo construir la imagen
./docker.sh run      # Construir y ejecutar
./docker.sh stop     # Detener contenedor
./docker.sh clean    # Limpiar imágenes y contenedores
./docker.sh logs     # Ver logs en tiempo real
./docker.sh shell    # Abrir shell en el contenedor
./docker.sh help     # Mostrar ayuda
```

### Comandos Docker Manuales

```bash
# Construir la imagen
docker build -t eduassist-frontend:latest .

# Ejecutar el contenedor
docker run -d --name eduassist-frontend-container -p 3000:80 eduassist-frontend:latest

# Ver logs
docker logs -f eduassist-frontend-container

# Detener y eliminar
docker stop eduassist-frontend-container
docker rm eduassist-frontend-container
```

## 🌐 Acceso a la Aplicación

Una vez que el contenedor esté ejecutándose:

- **URL Principal**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
```bash
docker logs -f eduassist-frontend-container
```

### Health check manual:
```bash
curl http://localhost:3000/health
```

### Acceder al contenedor:
```bash
docker exec -it eduassist-frontend-container sh
```

## 🔧 Configuración de Producción

### Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.production.example .env.production.local
   ```

2. Edita las variables según tu entorno:
   ```bash
   REACT_APP_API_BASE_URL=https://tu-api.com
   REACT_APP_ENVIRONMENT=production
   ```

### Build Personalizado

Para usar variables de entorno específicas:

```bash
# Con archivo .env personalizado
docker build --build-arg ENV_FILE=.env.production.local -t eduassist-frontend:prod .

# Con variables específicas
docker run -d \
  --name eduassist-frontend-container \
  -p 3000:80 \
  -e REACT_APP_API_BASE_URL=https://api.tudominio.com \
  eduassist-frontend:latest
```

## 🐳 Docker Compose

### Desarrollo:
```bash
docker-compose up -d
```

### Producción:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Optimizaciones

### Tamaño de Imagen
- Multi-stage build reduce el tamaño final
- Solo incluye archivos de producción
- Usa nginx alpine (muy liviano)

### Performance
- Compresión gzip habilitada
- Cache optimizado para assets
- Headers de seguridad incluidos

### Seguridad
- Usuario no-root
- Headers de seguridad
- Minimal attack surface

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puerto ya en uso**:
   ```bash
   # Cambiar el puerto
   docker run -d --name eduassist-frontend-container -p 8080:80 eduassist-frontend:latest
   ```

2. **Error de build por dependencias**:
   ```bash
   # Limpiar cache y rebuildar con force
   docker system prune -f
   docker build --no-cache -t eduassist-frontend:latest .
   
   # Si persisten conflictos de peer dependencies
   docker build --no-cache --build-arg NPM_FLAGS="--legacy-peer-deps" -t eduassist-frontend:latest .
   ```

3. **Problemas de permisos** (Linux):
   ```bash
   sudo chmod +x docker.sh
   ```

### Logs Útiles

```bash
# Logs de nginx
docker exec eduassist-frontend-container cat /var/log/nginx/error.log

# Logs de acceso
docker exec eduassist-frontend-container cat /var/log/nginx/access.log
```

## 📝 Notas Adicionales

- La aplicación usa nginx como servidor web en producción
- El health check está configurado en `/health`
- Los archivos estáticos tienen cache de 1 año
- El `index.html` no tiene cache para permitir actualizaciones
- La configuración soporta React Router para SPAs
