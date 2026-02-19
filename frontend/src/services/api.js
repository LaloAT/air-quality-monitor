import axios from 'axios';
import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (usuario, contraseña) =>
  api.post('/api/auth/login', { usuario, contraseña }).then(r => r.data);

// Mediciones
export const getMediciones = (horas = 24) =>
  api.get(`/api/mediciones?horas=${horas}`).then(r => r.data);

export const getUltimaMedicion = () =>
  api.get('/api/mediciones/ultima').then(r => r.data);

// Alertas
export const getAlertas = (horas = 24) =>
  api.get(`/api/alertas?horas=${horas}`).then(r => r.data);

export const getConteoAlertas = (horas = 24) =>
  api.get(`/api/alertas/conteo?horas=${horas}`).then(r => r.data);

// Simulador
export const simularMedicion = () =>
  api.post('/api/simulador/generar').then(r => r.data);

export const simularAlerta = () =>
  api.post('/api/simulador/alerta').then(r => r.data);

export const simularHistorial = (cantidad = 288) =>
  api.post(`/api/simulador/historial?cantidad=${cantidad}`).then(r => r.data);

// Telegram
export const simularTelegram = () =>
  api.post('/api/telegram/simular').then(r => r.data);

export const simularTelegramAlerta = () =>
  api.post('/api/telegram/simular-alerta').then(r => r.data);

export const getTelegramStatus = () =>
  api.get('/api/telegram/status').then(r => r.data);

// Export
export const exportCSV = (desde, hasta) => {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  return api.get(`/api/export/csv?${params}`, { responseType: 'blob' }).then(r => r.data);
};
