# Plataforma de Microservicios con ROBLE

## Descripción del Proyecto

Plataforma de microservicios dinámicos desarrollada como proyecto académico que implementa una arquitectura escalable integrada con **ROBLE** (plataforma de autenticación y base de datos de la Universidad del Norte).

**Características principales:**
- Autenticación centralizada con ROBLE usando JWT tokens
- Gestión dinámica de microservicios desde dashboard web
- Arquitectura containerizada con Docker y Docker Compose
- API REST completa con endpoints de procesamiento de datos (filtrado, agregación, CRUD)
- Interfaz web intuitiva para administración y pruebas de endpoints
- Integración completa con base de datos ROBLE para operaciones persistentes

**Tecnologías utilizadas:**
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend Dashboard**: Node.js + Express
- **Microservicios**: Python + Flask
- **Base de datos**: ROBLE (PostgreSQL)
- **Contenedores**: Docker + Docker Compose
- **Autenticación**: JWT tokens vía ROBLE

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD WEB                                │
│                   (Puerto 3000)                                │
│                   Node.js + Express                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Autenticación │ │   Gestión de    │ │   Prueba de     │   │
│  │      ROBLE      │ │  Microservicios │ │   Endpoints     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP + JWT Token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│            MICROSERVICIO TEMPLATE (Puerto 5000)                │
│                     Python + Flask                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │   Health    │ │ Filtrado de │ │      Agregación         │   │
│  │   Check     │ │    Datos    │ │      de Datos           │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │ Procesamiento│ │ Operaciones │ │    Información          │   │
│  │   Genérico  │ │    CRUD     │ │    del Servicio         │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS + JWT Token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA ROBLE                             │
│          https://roble-api.openlab.uninorte.edu.co             │
│  ┌─────────────────┐           ┌─────────────────────────────┐  │
│  │   AUTENTICACIÓN │           │      BASE DE DATOS          │  │
│  │                 │           │      (PostgreSQL)           │  │
│  │ • Login/Logout  │ ◄────────► │ • Tabla usuarios           │  │
│  │ • Verificación  │           │ • Operaciones CRUD          │  │
│  │ • Refresh Token │           │ • Consultas con filtros     │  │
│  └─────────────────┘           └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Instrucciones de Uso

### Prerrequisitos
- Docker Desktop instalado
- Cuenta en ROBLE con correo @uninorte.edu.co
- Puertos 3000 y 5000 disponibles

### Configuración y Despliegue

1. **Configurar variables de entorno:**
   Editar el archivo `.env`:
   ```env
   ROBLE_BASE_HOST=https://roble-api.openlab.uninorte.edu.co
   ROBLE_CONTRACT=tu_token_contract_aqui
   ```

2. **Construir y ejecutar servicios:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Verificar despliegue:**
   ```bash
   docker-compose ps
   ```

### Acceso y Uso

- **Dashboard Web**: http://localhost:3000
- **API Microservicio**: http://localhost:5000

**Flujo de uso:**
1. Iniciar sesión con credenciales ROBLE (@uninorte.edu.co)
2. Crear microservicios desde "Nuevo Microservicio"  
3. Probar endpoints desde la sección "Probar Endpoints"
4. Gestionar servicios (editar/eliminar) desde las tarjetas

### Detener Servicios

```bash
docker-compose down
```

## Ejemplos de Solicitudes y Respuestas

### Test 1: Health Check

**Endpoint:** `/health`  
**Método:** `GET`  
**Datos JSON:** (vacío)

```json
// Respuesta
{
  "service": "template-service",
  "status": "healthy",
  "timestamp": "2025-09-19T15:45:00.000Z",
  "roble_connection": "ok"
}
```

### Test 2: Información del Microservicio

**Endpoint:** `/api/info`  
**Método:** `GET`  
**Datos JSON:** (vacío)

```json
// Respuesta
{
  "service_name": "template-service",
  "version": "1.0.0",
  "description": "Microservicio template con integración ROBLE",
  "endpoints": ["/health", "/api/info", "/api/process", "/api/data-filter", "/api/data-aggregation", "/api/crud"],
  "user": "usuario@uninorte.edu.co",
  "roble_database": "microservices_roble_e65ac352d7"
}
```

### Test 3: Operaciones CRUD

**Endpoint:** `/api/crud`  
**Método:** `POST`  
**Datos JSON:**
```json
{
  "operation": "read",
  "table": "usuarios"
}
```

**Respuesta:**
```json
{
  "success": true,
  "service": "template-service",
  "operation": "read",
  "table": "usuarios",
  "result": [
    {
      "_id": "abc123def456",
      "name": "Juan Pérez",
      "email": "juan@uninorte.edu.co",
      "age": 30,
      "city": "Barranquilla",
      "active": true
    }
  ],
  "timestamp": "2025-09-19T15:50:00.000Z"
}
```

### Test 4: Filtrado de Datos

**Endpoint:** `/api/data-filter`  
**Método:** `POST`  
**Datos JSON:**
```json
{
  "table": "usuarios",
  "filters": {},
  "custom_filters": {}
}
```

**Respuesta:**
```json
{
  "success": true,
  "service": "template-service",
  "table": "usuarios",
  "total_records": 3,
  "data": [
    {
      "_id": "abc123",
      "name": "Juan Pérez",
      "email": "juan@test.com",
      "age": 30,
      "city": "Barranquilla",
      "active": true
    }
  ],
  "filters_applied": {},
  "timestamp": "2025-09-19T15:52:00.000Z"
}
```

### Test 5: Agregación de Datos

**Endpoint:** `/api/data-aggregation`  
**Método:** `POST`  
**Datos JSON:**
```json
{
  "table": "usuarios",
  "aggregation": "count"
}
```

**Respuesta:**
```json
{
  "success": true,
  "service": "template-service",
  "table": "usuarios",
  "aggregation_type": "count",
  "result": {
    "total_count": 3
  },
  "timestamp": "2025-09-19T15:55:00.000Z"
}
```


