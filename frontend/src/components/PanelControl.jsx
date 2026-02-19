import { useState, useEffect } from 'react';
import {
  simularMedicion, simularAlerta, simularTelegram,
  simularTelegramAlerta, getTelegramStatus, exportCSV,
} from '../services/api';

export default function PanelControl() {
  const [loading, setLoading] = useState('');
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTelegramStatus();
        setTelegramStatus(data);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const ejecutar = async (nombre, fn) => {
    setLoading(nombre);
    setMensaje('');
    try {
      await fn();
      setMensaje(`${nombre} ejecutado`);
    } catch (err) {
      setMensaje(`Error: ${err.response?.data?.mensaje || err.message}`);
    }
    setLoading('');
    setTimeout(() => setMensaje(''), 3000);
  };

  const descargarCSV = async () => {
    setLoading('csv');
    try {
      const blob = await exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mediciones.csv';
      a.click();
      URL.revokeObjectURL(url);
      setMensaje('CSV descargado');
    } catch (err) {
      setMensaje('Error al descargar CSV');
    }
    setLoading('');
    setTimeout(() => setMensaje(''), 3000);
  };

  const botones = [
    { nombre: 'Simular lectura', icon: '📊', fn: simularMedicion },
    { nombre: 'Simular alerta', icon: '⚠️', fn: simularAlerta },
    { nombre: 'Enviar a Telegram', icon: '📲', fn: simularTelegram },
    { nombre: 'Alerta Telegram', icon: '🚨', fn: simularTelegramAlerta },
  ];

  return (
    <div className="space-y-3">
      {/* Estado Telegram */}
      <div className="flex items-center gap-2 text-sm">
        <span>{telegramStatus?.conectado ? '🟢' : '🔴'}</span>
        <span className="text-gray-600">
          Bot Telegram: {telegramStatus?.conectado ? 'Conectado' : 'Desconectado'}
        </span>
        {telegramStatus?.mensajesProcesados > 0 && (
          <span className="text-xs text-gray-400">({telegramStatus.mensajesProcesados} mensajes)</span>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-2">
        {botones.map((b) => (
          <button
            key={b.nombre}
            onClick={() => ejecutar(b.nombre, b.fn)}
            disabled={!!loading}
            className="text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            {b.icon} {loading === b.nombre ? 'Enviando...' : b.nombre}
          </button>
        ))}
        <button
          onClick={descargarCSV}
          disabled={!!loading}
          className="text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
        >
          📥 {loading === 'csv' ? 'Descargando...' : 'Descargar CSV'}
        </button>
      </div>

      {/* Feedback */}
      {mensaje && (
        <p className="text-xs text-gray-500">{mensaje}</p>
      )}
    </div>
  );
}
