import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/auth';
import { getUltimaMedicion, simularHistorial } from '../services/api';
import GaugeVelocimetro from './GaugeVelocimetro';
import SelectorRango from './SelectorRango';
import GraficaHistorial from './GraficaHistorial';

const GAUGE_CONFIG = [
  {
    key: 'pM25',
    label: 'PM2.5',
    min: 0,
    max: 100,
    unidad: 'µg/m³',
    umbrales: [
      { valor: 15, color: '#22c55e' },
      { valor: 35, color: '#eab308' },
      { valor: 100, color: '#ef4444' },
    ],
  },
  {
    key: 'cO2',
    label: 'CO₂',
    min: 400,
    max: 2000,
    unidad: 'ppm',
    umbrales: [
      { valor: 900, color: '#22c55e' },
      { valor: 1200, color: '#eab308' },
      { valor: 2000, color: '#ef4444' },
    ],
  },
  {
    key: 'tvoc',
    label: 'TVOC',
    min: 0,
    max: 500,
    unidad: 'ppb',
    umbrales: [
      { valor: 120, color: '#22c55e' },
      { valor: 220, color: '#eab308' },
      { valor: 500, color: '#ef4444' },
    ],
  },
];

function estadoColor(estado) {
  if (estado === 'Bueno') return 'bg-green-100 text-green-700';
  if (estado === 'Regular') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function Dashboard() {
  const [ultima, setUltima] = useState(null);
  const [error, setError] = useState('');
  const [horas, setHoras] = useState(24);
  const [generando, setGenerando] = useState(false);
  const navigate = useNavigate();

  const fetchUltima = async () => {
    try {
      const data = await getUltimaMedicion();
      setUltima(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        removeToken();
        navigate('/login');
      } else {
        setError('Sin conexión al servidor');
      }
    }
  };

  useEffect(() => {
    fetchUltima();
    const interval = setInterval(fetchUltima, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌬️</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AirQuality Monitor</h1>
              <p className="text-xs text-gray-500">Universidad de Guanajuato — UGTO</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {ultima && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoColor(ultima.estado)}`}>
                {ultima.estado}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Gauges */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Medidores en tiempo real</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GAUGE_CONFIG.map((g) => (
              <GaugeVelocimetro
                key={g.key}
                valor={ultima?.[g.key]}
                min={g.min}
                max={g.max}
                umbrales={g.umbrales}
                unidad={g.unidad}
                label={g.label}
              />
            ))}
          </div>
        </section>

        {/* Datos secundarios */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Temperatura', valor: ultima?.temperatura, unidad: '°C', icon: '🌡' },
              { label: 'Humedad', valor: ultima?.humedad, unidad: '%', icon: '💧' },
              { label: 'PM10', valor: ultima?.pM10, unidad: 'µg/m³', icon: '🌫' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4 flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold text-gray-800">
                    {item.valor != null ? Math.round(item.valor * 10) / 10 : '--'}
                    <span className="text-sm font-normal text-gray-400 ml-1">{item.unidad}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Historial</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  setGenerando(true);
                  try { await simularHistorial(288); } catch {}
                  setGenerando(false);
                }}
                disabled={generando}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                {generando ? 'Generando...' : 'Simular historial'}
              </button>
              <SelectorRango horasActual={horas} onChange={setHoras} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <GraficaHistorial horas={horas} />
          </div>
        </section>

        {/* Alerts & Heatmap placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Mapa de calor</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Heatmap — Fase 8</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Alertas recientes</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Tabla de alertas — Fase 8</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          Prácticas Profesionales — Ingeniería Física — UGTO 2026
        </div>
      </footer>
    </div>
  );
}
