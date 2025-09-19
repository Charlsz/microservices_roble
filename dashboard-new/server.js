const express = require('express');
const axios = require('axios');
const Docker = require('dockerode');
const path = require('path');

const app = express();
const docker = new Docker(); // Para gestión dinámica de contenedores

app.use(express.json());
app.use(express.static('public'));

// Configuración ROBLE
const ROBLE_BASE_HOST = process.env.ROBLE_BASE_HOST || 'https://roble-api.openlab.uninorte.edu.co';
const ROBLE_CONTRACT = process.env.ROBLE_CONTRACT || 'microservices_roble_e65ac352d7';

// Estado de microservicios registrados
const registeredServices = new Map();
let nextPort = 5000;

// Middleware de autenticación ROBLE
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const response = await axios.get(
            `${ROBLE_BASE_HOST}/auth/${ROBLE_CONTRACT}/verify-token`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        req.user = response.data;
        req.token = token;
        next();
    } catch (error) {
        console.error('Error verificando token:', error.response?.data);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Ruta principal - Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// LOGIN con ROBLE
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const response = await axios.post(
            `${ROBLE_BASE_HOST}/auth/${ROBLE_CONTRACT}/login`,
            { email, password }
        );
        
        res.json({
            success: true,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
        });
    } catch (error) {
        console.error('Error en login:', error.response?.data);
        res.status(401).json({ 
            error: 'Credenciales inválidas',
            details: error.response?.data?.message 
        });
    }
});

// LISTAR microservicios registrados
app.get('/api/microservices', authenticateToken, (req, res) => {
    const services = Array.from(registeredServices.values());
    res.json({ services });
});

// REGISTRAR nuevo microservicio
app.post('/api/microservices', authenticateToken, async (req, res) => {
    const { name, type, description, processingLogic } = req.body;
    
    if (!name || !type) {
        return res.status(400).json({ error: 'Nombre y tipo son requeridos' });
    }

    if (registeredServices.has(name)) {
        return res.status(409).json({ error: 'Microservicio ya existe' });
    }

    try {
        const servicePort = 5000;
        const serviceData = {
            name,
            type,
            description,
            port: servicePort,
            url: `http://microservice-template:${servicePort}`,
            status: 'creating',
            createdAt: new Date().toISOString(),
            endpoints: ['/health', '/api/info', '/api/process', '/api/data-filter', '/api/data-aggregation', '/api/crud']
        };

        registeredServices.set(name, serviceData);

        // TODO: Crear contenedor dinámicamente
        // await createMicroserviceContainer(name, type, servicePort);
        
        // Por ahora simulamos creación exitosa
        setTimeout(() => {
            serviceData.status = 'running';
        }, 2000);

        res.status(201).json({
            success: true,
            service: serviceData
        });
    } catch (error) {
        console.error('Error creando microservicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR microservicio
app.delete('/api/microservices/:name', authenticateToken, async (req, res) => {
    const { name } = req.params;
    
    if (!registeredServices.has(name)) {
        return res.status(404).json({ error: 'Microservicio no encontrado' });
    }

    try {
        // TODO: Eliminar contenedor
        // await removeMicroserviceContainer(name);
        
        registeredServices.delete(name);
        
        res.json({ success: true, message: `Microservicio ${name} eliminado` });
    } catch (error) {
        console.error('Error eliminando microservicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PROBAR endpoint de microservicio
app.post('/api/test-endpoint', authenticateToken, async (req, res) => {
    const { serviceName, endpoint, method = 'GET', data } = req.body;
    
    const service = registeredServices.get(serviceName);
    if (!service) {
        return res.status(404).json({ error: 'Microservicio no encontrado' });
    }

    try {
        const url = `${service.url}${endpoint}`;
        const config = {
            method,
            headers: { 
                'Authorization': `Bearer ${req.token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        const response = await axios(url, config);
        
        res.json({
            success: true,
            response: {
                status: response.status,
                data: response.data
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error probando endpoint',
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Dashboard ejecutándose en puerto ${PORT}`);
    console.log(`📋 Panel: http://localhost:${PORT}`);
    console.log(`🔗 ROBLE: ${ROBLE_BASE_HOST}/auth/${ROBLE_CONTRACT}`);
});

module.exports = app;