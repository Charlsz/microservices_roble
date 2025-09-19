#  Plataforma de Microservicios con ROBLE

##  Descripción del Proyecto

Plataforma de microservicios dinámicos desarrollada como proyecto académico que implementa una arquitectura escalable integrada con **ROBLE** (plataforma de autenticación y base de datos de la Universidad del Norte).

### Características principales:
-  **Autenticación centralizada** con ROBLE
-  **Gestión dinámica** de microservicios desde dashboard web
-  **Arquitectura containerizada** con Docker y Docker Compose
-  **API REST** completa con endpoints de procesamiento de datos
-  **Interfaz web intuitiva** para administración
-  **Integración completa** con base de datos ROBLE

### Tecnologías utilizadas:
- **Frontend**: HTML5, CSS3, JavaScript (Bootstrap 5)
- **Backend Dashboard**: Node.js + Express
- **Microservicios**: Python + Flask
- **Base de datos**: ROBLE (PostgreSQL)
- **Contenedores**: Docker + Docker Compose
- **Autenticación**: JWT tokens vía ROBLE

##  Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD WEB                                │
│                   (Puerto 3000)                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Autenticación │ │   Gestión de    │ │   Prueba de     │   │
│  │      ROBLE      │ │  Microservicios │ │   Endpoints     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RED DE MICROSERVICIOS                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            MICROSERVICIO TEMPLATE                      │   │
│  │                (Puerto 5000)                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │   Health    │ │ Filtrado de │ │   Agregación    │   │   │
│  │  │   Check     │ │    Datos    │ │   de Datos      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ Procesamiento│ │ Operaciones │ │    Info del     │   │   │
│  │  │   Genérico  │ │    CRUD     │ │   Servicio      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┐   │
│                          ▲                                 │   │
│                          │ Token JWT                       │   │
│                          ▼                                 │   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA ROBLE                             │
│                                                                 │
│  ┌─────────────────┐           ┌─────────────────────────────┐  │
│  │   AUTENTICACIÓN │           │      BASE DE DATOS          │  │
│  │                 │           │                             │  │
│  │ • Login/Logout  │ ◄────────► │ • Tablas dinámicas         │  │
│  │ • Verificación  │           │ • Operaciones CRUD          │  │
│  │ • Refresh Token │           │ • Consultas con filtros     │  │
│  └─────────────────┘           └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
microservices_roble/
├── 📄 .env                          # Variables de entorno
├── 📄 docker-compose.yml            # Orquestación de contenedores
├── 📄 README.md                     # Documentación
│
├── 📁 dashboard-new/                # Dashboard principal
│   ├── 📁 public/
│   │   ├── 📄 index.html           # Interfaz web
│   │   ├── 📄 app.js              # Lógica frontend
│   │   └── 📄 styles.css          # Estilos
│   ├── 📄 server.js               # Servidor Express
│   ├── 📄 package.json            # Dependencias Node.js
│   └── 📄 Dockerfile              # Imagen Docker
│
└── 📁 microservice-template/        # Microservicio base
    ├── 📄 app.py                   # Aplicación Flask
    ├── 📄 requirements.txt         # Dependencias Python
    └── 📄 Dockerfile              # Imagen Docker
```

##  Instrucciones de Uso

### Prerrequisitos
- Docker Desktop instalado
- Cuenta en ROBLE con correo @uninorte.edu.co
- Puerto 3000 y 5000 disponibles

### 1. Configuración inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Charlsz/microservices_roble.git
   cd microservices_roble
   ```

2. **Configurar variables de entorno:**
   Editar el archivo `.env` con tu token de ROBLE:
   ```env
   ROBLE_BASE_HOST=https://roble-api.openlab.uninorte.edu.co
   ROBLE_CONTRACT=tu_token_contract_aqui
   ```

### 2. Despliegue

**Construir y ejecutar todos los servicios:**
```bash
docker-compose build
docker-compose up -d
```

**Verificar que los servicios estén ejecutándose:**
```bash
docker-compose ps
```

### 3. Acceso a la plataforma

- **Dashboard Web**: http://localhost:3000
- **API Microservicio**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 4. Uso del Dashboard

1. **Iniciar sesión** con credenciales ROBLE
2. **Crear microservicios** desde el botón "Nuevo Microservicio"
3. **Gestionar servicios** existentes (editar/eliminar)
4. **Probar endpoints** desde la sección de pruebas

### 5. Detener los servicios

```bash
docker-compose down
```

## 📝 Ejemplos de Solicitudes y Respuestas

###  Autenticación

**POST** `/api/login`
```json
// Solicitud
{
  "email": "usuario@uninorte.edu.co",
  "password": "mi_password"
}

// Respuesta exitosa
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

###  Gestión de Microservicios

**GET** `/api/microservices`
```json
// Respuesta
{
  "services": [
    {
      "name": "data-processor",
      "type": "data-analysis",
      "description": "Procesamiento avanzado de datos",
      "port": 5001,
      "url": "http://localhost:5001",
      "status": "running",
      "createdAt": "2025-09-18T10:30:00.000Z",
      "endpoints": ["/api/data-analysis", "/api/data-analysis/process"]
    }
  ]
}
```

**POST** `/api/microservices`
```json
// Solicitud
{
  "name": "user-analytics",
  "type": "data-aggregation",
  "description": "Análisis de comportamiento de usuarios"
}

// Respuesta
{
  "success": true,
  "service": {
    "name": "user-analytics",
    "type": "data-aggregation",
    "port": 5002,
    "url": "http://localhost:5002",
    "status": "creating",
    "endpoints": ["/api/data-aggregation", "/api/data-aggregation/process"]
  }
}
```

###  Microservicio Template

**GET** `/health`
```json
{
  "service": "template-service",
  "status": "healthy",
  "timestamp": "2025-09-18T15:45:30.123Z",
  "roble_connection": "ok"
}
```

**GET** `/api/info` (requiere autenticación)
```json
{
  "service_name": "template-service",
  "version": "1.0.0",
  "description": "Microservicio template con integración ROBLE",
  "endpoints": [
    "/health",
    "/api/info", 
    "/api/process",
    "/api/data-filter",
    "/api/data-aggregation",
    "/api/crud"
  ],
  "user": "usuario@uninorte.edu.co",
  "roble_database": "microservices_roble_e65ac352d7"
}
```

**POST** `/api/data-filter` (requiere autenticación)
```json
// Solicitud
{
  "table": "usuarios",
  "filters": {
    "status": "active"
  },
  "custom_filters": {
    "age_range": "18-25"
  }
}

// Respuesta
{
  "success": true,
  "service": "template-service",
  "table": "usuarios",
  "total_records": 150,
  "data": [
    {
      "_id": "abc123def456",
      "name": "Juan Pérez",
      "email": "juan@uninorte.edu.co",
      "status": "active"
    }
  ],
  "filters_applied": {
    "status": "active"
  },
  "timestamp": "2025-09-18T15:50:00.000Z"
}
```

**POST** `/api/crud` (requiere autenticación)
```json
// Solicitud - Crear registros
{
  "operation": "create",
  "table": "productos", 
  "records": [
    {
      "name": "Laptop HP",
      "price": 1500000,
      "category": "tecnologia"
    }
  ]
}

// Respuesta
{
  "success": true,
  "service": "template-service",
  "operation": "create",
  "table": "productos",
  "result": {
    "inserted": [
      {
        "_id": "xyz789abc123",
        "name": "Laptop HP",
        "price": 1500000,
        "category": "tecnologia"
      }
    ],
    "skipped": []
  }
}
```

##  Desarrollo y Extensión

### Agregar nuevo microservicio

1. Crear carpeta con estructura similar a `microservice-template`
2. Implementar integración ROBLE
3. Agregar servicio al `docker-compose.yml`
4. Registrar en el dashboard

### Variables de entorno disponibles

- `ROBLE_BASE_HOST`: URL base de ROBLE
- `ROBLE_CONTRACT`: Token del proyecto ROBLE
- `SERVICE_NAME`: Nombre del microservicio
- `SERVICE_PORT`: Puerto del microservicio

##  Características Implementadas

-  **Autenticación JWT** con ROBLE
-  **Dashboard web completo** 
-  **Gestión dinámica de servicios**
-  **Integración completa con base de datos ROBLE**
-  **API REST con múltiples endpoints**
-  **Manejo de errores HTTP** (401, 403, 500)
-  **Contenedorización completa**
-  **Health checks automáticos**
-  **Arquitectura escalable**

## Autor

**Charlsz** - [GitHub](https://github.com/Charlsz)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
