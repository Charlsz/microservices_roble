<h1> Plataforma de Microservicios con Roble</h1>

<h2>Descripción</h2>
Sistema de microservicios dinámicos que se conectan con la plataforma Roble para autenticación y almacenamiento de datos.

<p>Este proyecto consta de una plataforma con microservicios separados para <strong>productos</strong> y <strong>usuarios</strong>, cada uno con autenticación basada en Roble y acceso CRUD seguro a datos en la plataforma.</p>
<h2>Estructura del Proyecto</h2>
<pre><code>MICROSERVICES/
│
├── dashboard/             # Microservicio dashboard (frontend, administración)
├── product/               # Microservicio productos
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── user/                  # Microservicio usuarios
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── .env                   # Variables de entorno (no versionar)
├── .dockerignore          # Archivos a ignorar en Docker
├── docker-compose.yml     # Orquestador de todos los servicios
└── Readme.md              # Documentación del proyecto
</code></pre>
<h2>Requisitos</h2>
<ul>
  <li>Docker y Docker Compose instalados.</li>
  <li>Credenciales válidas y verificadas en Roble.</li>
  <li>Variables de entorno en <code>.env</code> para conectar con Roble:
    <pre><code>ROBLE_BASE_HOST=https://roble-api.openlab.uninorte.edu.co
ROBLE_CONTRACT=tu_proyecto_ID #Identificador de tu proyecto</code></pre>
  </li>
</ul>
<h2>Cómo levantar el proyecto</h2>
<ol>
  <li>Clona el repositorio y navega al directorio raíz <code>MICROSERVICES</code>.</li>
  <li>Construye y levanta los servicios con:
    <pre><code>docker-compose up --build</code></pre>
  </li>
  <li>Los servicios correrán en estos puertos por defecto:
    <ul>
      <li>Dashboard: <a href="http://localhost:3000">http://localhost:3000</a></li>
      <li>Product API: <a href="http://localhost:5000">http://localhost:5000</a></li>
      <li>User API: <a href="http://localhost:5001">http://localhost:5001</a></li>
    </ul>
  </li>
</ol>
<h2>Uso básico</h2>
<h3>Autenticación</h3>
<p>Obtén tokens haciendo POST a <code>/login</code> con JSON:</p>
<pre><code>{
  "email": "tu_correo@ejemplo.com",
  "password": "tu_contraseña"
}</code></pre>
<p>Recibirás <code>accessToken</code> y <code>refreshToken</code>.</p>
<h3>Endpoints protegidos</h3>
<p>En las peticiones a <code>/product</code> y <code>/user</code> incluye los headers:</p>
<pre><code>x-user-email: tu_correo@ejemplo.com
Authorization: Bearer &lt;accessToken&gt;</code></pre>
<p>Puedes hacer operaciones CRUD con los métodos HTTP: GET, POST, PUT, DELETE según se requiera.</p>
<h2>Consideraciones</h2>
<ul>
  <li>Se maneja renovación automática de tokens expirados con el <code>refreshToken</code>.</li>
  <li>Es necesario tener los usuarios verificados en Roble.</li>
  <li>El dashboard permite administrar visualmente los microservicios (en desarrollo).</li>
</ul>

</br>
</br>
</br>


<h2>Estado de Requisitos</h2>

<h2> Requisitos Completados</h2>
<ul>
  <li>Containerización con Docker y Docker Compose</li>
  <li>Autenticación básica con Roble</li>
  <li>Estructura de microservicios independientes</li>
  <li>Dashboard web básico</li>
  <li>Gestión de tokens</li>
  <li>Endpoints HTTP básicos</li>
</ul>

<h2>Requisitos Pendientes</h2>

<h4>1. Procesamiento de Datos en Microservicios</h4>
<ul>
  <li>Implementar filtrado específico:
    <ul>
      <li>Servicio Users: filtrar por rol, status</li>
      <li>Servicio Products: filtrar por categoría</li>
    </ul>
  </li>
  <li>Agregar funciones de agregación y análisis</li>
  <li>Implementar transformación de datos según tipo de servicio</li>
</ul>

<h4>2. Gestión Dinámica de Servicios</h4>
<ul>
  <li>Permitir crear nuevos servicios sin reiniciar la plataforma</li>
  <li>Implementar eliminación dinámica de servicios</li>
  <li>Agregar edición de configuraciones en tiempo real</li>
  <li>Sistema de plantillas para nuevos servicios</li>
</ul>

<h4>3. Manejo de Errores Mejorado</h4>
<ul>
  <li>Implementar respuestas HTTP específicas:
    <ul>
      <li>401 Unauthorized para tokens inválidos</li>
      <li>403 Forbidden para accesos denegados</li>
      <li>500 Internal Server Error para errores del servidor</li>
    </ul>
  </li>
  <li>Sistema de logging detallado</li>
  <li>Manejo centralizado de errores</li>
</ul>

<h4>4. Documentación Adicional Requerida</h4>
<ul>
  <li>Ejemplos de requests y responses para cada endpoint</li>
  <li>Diagrama detallado de arquitectura</li>
  <li>Guía de troubleshooting</li>
  <li>Documentación de procesamiento específico por servicio</li>
</ul>

