<h1>Proyecto de Microservicios con Roble</h1>
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
