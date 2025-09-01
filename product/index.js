import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const BASE_URL = process.env.ROBLE_BASE_HOST;
const CONTRACT = process.env.ROBLE_CONTRACT;

const tokensByUser = new Map();

function saveTokens(email, accessToken, refreshToken) {
  tokensByUser.set(email, { accessToken, refreshToken });
}

function getTokens(email) {
  return tokensByUser.get(email) || {};
}

async function ensureAuth(req, res, next) {
  const userEmail = req.headers["x-user-email"];
  if (!userEmail) {
    return res.status(400).json({
      error: "Falta header x-user-email. Usa Postman o curl con el header."
    });
  }

  const { accessToken } = getTokens(userEmail);
  if (!accessToken) return res.status(401).json({ error: "No autenticado" });

  req.accessToken = accessToken;
  req.userEmail = userEmail;
  next();
}

async function refreshAccessToken(userEmail) {
  const tokens = getTokens(userEmail);
  if (!tokens?.refreshToken) return false;

  try {
    const res = await axios.post(`${BASE_URL}/auth/${CONTRACT}/refresh-token`, {
      refreshToken: tokens.refreshToken
    });
    saveTokens(userEmail, res.data.accessToken, tokens.refreshToken);
    return res.data.accessToken;
  } catch {
    return false;
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Microservicio PRODUCT activo. Usa los endpoints /login, /product, etc."
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Faltan email o password" });

    const response = await axios.post(`${BASE_URL}/auth/${CONTRACT}/login`, {
      email,
      password
    });
    saveTokens(email, response.data.accessToken, response.data.refreshToken);
    res.json({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    });
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

app.post("/product", ensureAuth, async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0)
    return res.status(400).json({ error: "Faltan datos en el cuerpo" });

  try {
    const response = await axios.post(
      `${BASE_URL}/database/${CONTRACT}/insert`,
      { tableName: "products", records: [req.body] },
      { headers: { Authorization: `Bearer ${req.accessToken}` } }
    );
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken(req.userEmail);
      if (!newToken) return res.status(401).json({ error: "Token expirado" });
      req.accessToken = newToken;
      const retryResp = await axios.post(
        `${BASE_URL}/database/${CONTRACT}/insert`,
        { tableName: "products", records: [req.body] },
        { headers: { Authorization: `Bearer ${newToken}` } }
      );
      return res.json(retryResp.data);
    }
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

app.get("/product", ensureAuth, async (req, res) => {
  try {
    const params = { tableName: "products", ...req.query };
    const response = await axios.get(`${BASE_URL}/database/${CONTRACT}/read`, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
      params
    });
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken(req.userEmail);
      if (!newToken) return res.status(401).json({ error: "Token expirado" });
      req.accessToken = newToken;
      const retryResp = await axios.get(`${BASE_URL}/database/${CONTRACT}/read`, {
        headers: { Authorization: `Bearer ${newToken}` },
        params: { tableName: "products", ...req.query }
      });
      return res.json(retryResp.data);
    }
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

app.put("/product", ensureAuth, async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0)
    return res.status(400).json({ error: "Faltan datos en el cuerpo" });

  try {
    const { idValue, updates } = req.body;
    if (!idValue || !updates)
      return res.status(400).json({ error: "Faltan idValue o updates" });

    const response = await axios.put(
      `${BASE_URL}/database/${CONTRACT}/update`,
      {
        tableName: "products",
        idColumn: "_id",
        idValue,
        updates
      },
      { headers: { Authorization: `Bearer ${req.accessToken}` } }
    );
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken(req.userEmail);
      if (!newToken) return res.status(401).json({ error: "Token expirado" });
      req.accessToken = newToken;
      const retryResp = await axios.put(
        `${BASE_URL}/database/${CONTRACT}/update`,
        req.body,
        { headers: { Authorization: `Bearer ${newToken}` } }
      );
      return res.json(retryResp.data);
    }
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

app.delete("/product", ensureAuth, async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0)
    return res.status(400).json({ error: "Faltan datos en el cuerpo" });

  try {
    const { idValue } = req.body;
    if (!idValue) return res.status(400).json({ error: "Falta idValue" });

    const response = await axios.delete(`${BASE_URL}/database/${CONTRACT}/delete`, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
      data: { tableName: "products", idColumn: "_id", idValue }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken(req.userEmail);
      if (!newToken) return res.status(401).json({ error: "Token expirado" });
      req.accessToken = newToken;
      const retryResp = await axios.delete(`${BASE_URL}/database/${CONTRACT}/delete`, {
        headers: { Authorization: `Bearer ${newToken}` },
        data: req.body
      });
      return res.json(retryResp.data);
    }
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Microservicio PRODUCT corriendo en puerto ${PORT}`));
