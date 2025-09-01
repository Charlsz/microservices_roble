import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const BASE_URL = process.env.ROBLE_BASE_HOST;
const CONTRACT = process.env.ROBLE_CONTRACT;

// Almacena tokens por email de usuario
const tokensByUser = new Map();

function saveTokens(userEmail, accessToken, refreshToken) {
  tokensByUser.set(userEmail, { accessToken, refreshToken });
}

function getTokens(userEmail) {
  return tokensByUser.get(userEmail) || {};
}

// Middleware para validar token y recibir email como header
async function ensureAuth(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  if (!userEmail) {
    return res.status(400).json({ error: 'Falta encabezado x-user-email' });
  }
  const { accessToken, refreshToken } = getTokens(userEmail);
  if (!accessToken) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  req.accessToken = accessToken;
  req.refreshToken = refreshToken;
  req.userEmail = userEmail;
  next();
}

// Función para renovar accessToken con refreshToken
async function refreshAccessToken(userEmail) {
  const tokens = getTokens(userEmail);
  if (!tokens?.refreshToken) return false;
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/${CONTRACT}/refresh-token`,
      { refreshToken: tokens.refreshToken }
    );
    const newAccessToken = response.data.accessToken;
    saveTokens(userEmail, newAccessToken, tokens.refreshToken);
    return newAccessToken;
  } catch (err) {
    return false;
  }
}

// Endpoint login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await axios.post(`${BASE_URL}/auth/${CONTRACT}/login`, { email, password });
    saveTokens(email, response.data.accessToken, response.data.refreshToken);
    res.json({ message: 'Login exitoso', accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: error.message };
    res.status(status).json(message);
  }
});

// Endpoint signup directo (sin verificación)
app.post('/signup', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/${CONTRACT}/signup-direct`, req.body);
    res.status(response.status).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: error.message };
    res.status(status).json(message);
  }
});

// Endpoint logout
app.post('/logout', ensureAuth, async (req, res) => {
  try {
    await axios.post(
      `${BASE_URL}/auth/${CONTRACT}/logout`,
      null,
      { headers: { Authorization: `Bearer ${req.accessToken}` } }
    );
    // Limpia los tokens almacenados para ese usuario
    tokensByUser.delete(req.userEmail);
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: error.message };
    res.status(status).json(message);
  }
});

// Endpoint protegido para consultar tabla 'usuarios' (como ejemplo)
app.get('/datos-protegidos', ensureAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/database/${CONTRACT}/read`, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
      params: { tableName: 'usuarios' }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Intentar renovar token
      const newToken = await refreshAccessToken(req.userEmail);
      if (!newToken) {
        return res.status(401).json({ error: 'Token expirado, re-login requerido' });
      }
      // Reintentar solicitud con token renovado
      try {
        const retryResp = await axios.get(`${BASE_URL}/database/${CONTRACT}/read`, {
          headers: { Authorization: `Bearer ${newToken}` },
          params: { tableName: 'usuarios' }
        });
        return res.json(retryResp.data);
      } catch (retryErr) {
        return res.status(retryErr.response?.status || 500).json(retryErr.response?.data || { error: retryErr.message });
      }
    }
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});




// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Microservicio corriendo en puerto ${PORT}`));
