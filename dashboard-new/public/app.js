// Estado de la aplicación
let currentToken = localStorage.getItem('roble_token');
let currentUser = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (currentToken) {
        showMainPanel();
        loadServices();
    } else {
        showLoginPanel();
    }

    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('createServiceForm').addEventListener('submit', handleCreateService);
    document.getElementById('testForm').addEventListener('submit', handleTestEndpoint);
});

// Autenticación
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentToken = data.accessToken;
            localStorage.setItem('roble_token', currentToken);
            localStorage.setItem('roble_refresh', data.refreshToken);
            
            showMainPanel();
            loadServices();
            errorDiv.style.display = 'none';
        } else {
            showError(data.error || 'Error de autenticación');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error de conexión');
    }
}

function logout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('roble_token');
    localStorage.removeItem('roble_refresh');
    showLoginPanel();
}

// Interfaz
function showLoginPanel() {
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('mainPanel').style.display = 'none';
}

function showMainPanel() {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('mainPanel').style.display = 'block';
    document.getElementById('userInfo').textContent = '🟢 Conectado a ROBLE';
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Gestión de Microservicios
async function loadServices() {
    try {
        const response = await fetch('/api/microservices', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            displayServices(data.services);
            updateTestServiceOptions(data.services);
        } else {
            console.error('Error cargando servicios:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayServices(services) {
    const container = document.getElementById('servicesList');
    
    if (services.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="bi bi-info-circle"></i> 
                    No hay microservicios registrados. ¡Crea el primero!
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card service-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="bi bi-gear"></i> ${service.name}
                    </h6>
                    <span class="status-${service.status}">
                        <i class="bi bi-circle-fill"></i> ${service.status}
                    </span>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Tipo:</strong> ${service.type}<br>
                        <strong>Puerto:</strong> ${service.port}<br>
                        <strong>URL:</strong> <code>${service.url}</code>
                    </p>
                    <p class="text-muted small">${service.description || 'Sin descripción'}</p>
                    
                    <div class="mt-2">
                        <strong>Endpoints:</strong>
                        <ul class="list-unstyled small">
                            ${service.endpoints.map(ep => `<li><code>${ep}</code></li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="testService('${service.name}')">
                        <i class="bi bi-play"></i> Probar
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editService('${service.name}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService('${service.name}')">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleCreateService(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('serviceName').value,
        type: document.getElementById('serviceType').value,
        description: document.getElementById('serviceDescription').value
    };

    try {
        const response = await fetch('/api/microservices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createServiceModal'));
            modal.hide();
            
            // Limpiar formulario
            document.getElementById('createServiceForm').reset();
            
            // Recargar servicios
            loadServices();
            
            alert('✅ Microservicio creado exitosamente');
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error creando servicio:', error);
        alert('❌ Error de conexión');
    }
}

async function deleteService(serviceName) {
    if (!confirm(`¿Estás seguro de eliminar el microservicio "${serviceName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/microservices/${serviceName}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const data = await response.json();

        if (response.ok) {
            loadServices();
            alert('✅ Microservicio eliminado');
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error eliminando servicio:', error);
        alert('❌ Error de conexión');
    }
}

// Testing de endpoints
function updateTestServiceOptions(services) {
    const select = document.getElementById('testService');
    select.innerHTML = '<option value="">Seleccionar servicio...</option>';
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = `${service.name} (${service.url})`;
        select.appendChild(option);
    });
}

async function handleTestEndpoint(e) {
    e.preventDefault();
    
    const serviceName = document.getElementById('testService').value;
    const endpoint = document.getElementById('testEndpoint').value;
    const method = document.getElementById('testMethod').value;
    const dataText = document.getElementById('testData').value;
    
    let requestData = null;
    if (dataText.trim()) {
        try {
            requestData = JSON.parse(dataText);
        } catch (error) {
            alert('❌ JSON inválido en los datos');
            return;
        }
    }

    try {
        const response = await fetch('/api/test-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                serviceName,
                endpoint,
                method,
                data: requestData
            })
        });

        const result = await response.json();
        
        // Mostrar respuesta
        const responseDiv = document.getElementById('testResponse');
        responseDiv.textContent = JSON.stringify(result, null, 2);
        
        if (response.ok) {
            responseDiv.className = 'bg-light p-3 border border-success';
        } else {
            responseDiv.className = 'bg-light p-3 border border-danger';
        }

    } catch (error) {
        console.error('Error probando endpoint:', error);
        document.getElementById('testResponse').textContent = 'Error de conexión: ' + error.message;
        document.getElementById('testResponse').className = 'bg-light p-3 border border-danger';
    }
}

function testService(serviceName) {
    document.getElementById('testService').value = serviceName;
    document.getElementById('testEndpoint').value = '/api/process';
    document.getElementById('testEndpoint').focus();
}

function editService(serviceName) {
    // TODO: Implementar edición
    alert('🚧 Función de edición en desarrollo');
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-CO');
}