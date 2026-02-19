import { useState, useEffect } from 'react';
import {
  simularMedicion, simularAlerta, simularTelegram,
  simularTelegramAlerta, getTelegramStatus, exportCSV,
} from '../services/api';

const ICONOS_TOAST = {
  'Simular lectura': '✅ Medición simulada',
  'Simular alerta': '⚠️ Alerta simulada',
  'Enviar a Telegram': '📲 Enviado a Telegram',
  'Alerta Telegram': '🚨 Alerta enviada a Telegram',
};

export default function PanelControl() {
  const [loading, setLoading] = useState('');
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [toast, setToast] = useState(null); // {text, type: 'ok'|'error'}

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

  const showToast = (text, type = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ejecutar = async (nombre, fn) => {
    setLoading(nombre);
    try {
      await fn();
      showToast(ICONOS_TOAST[nombre] || `${nombre} ejecutado`, 'ok');
    } catch (err) {
      showToast(`Error: ${err.response?.data?.mensaje || err.message}`, 'error');
    }
    setLoading('');
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
      showToast('📥 CSV descargado', 'ok');
    } catch {
      showToast('Error al descargar CSV', 'error');
    }
    setLoading('');
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
            className="text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {b.icon} {loading === b.nombre ? 'Enviando...' : b.nombre}
          </button>
        ))}
        <button
          onClick={descargarCSV}
          disabled={!!loading}
          className="text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 {loading === 'csv' ? 'Descargando...' : 'Descargar CSV'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`text-xs px-3 py-2 rounded-lg inline-block animate-fade-in ${
          toast.type === 'ok'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
