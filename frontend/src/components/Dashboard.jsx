import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/auth';
import { getUltimaMedicion, simularHistorial } from '../services/api';
import GaugeVelocimetro from './GaugeVelocimetro';
import SelectorRango from './SelectorRango';
import GraficaHistorial from './GraficaHistorial';
import MapaCalor from './MapaCalor';
import TablaAlertas from './TablaAlertas';
import PanelControl from './PanelControl';

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

function GaugeSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col items-center animate-pulse">
      <div className="w-full max-w-[230px] h-[100px] bg-gray-100 rounded-lg" />
      <div className="mt-3 h-8 w-16 bg-gray-100 rounded" />
      <div className="mt-1 h-4 w-12 bg-gray-100 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const [ultima, setUltima] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setError('No se pudo conectar al servidor');
      }
    }
    setLoading(false);
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
      {/* Header — sticky */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🌬️</span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-800">AirQuality Monitor</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Universidad de Guanajuato — UGTO</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {ultima && (
              <span className={`text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full transition-colors duration-300 ${estadoColor(ultima.estado)}`}>
                {ultima.estado}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-gray-500 hover:text-red-500 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Gauges */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Medidores en tiempo real</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {loading
              ? [0, 1, 2].map((i) => <GaugeSkeleton key={i} />)
              : GAUGE_CONFIG.map((g) => (
                <GaugeVelocimetro
                  key={g.key}
                  valor={ultima?.[g.key]}
                  min={g.min}
                  max={g.max}
                  umbrales={g.umbrales}
                  unidad={g.unidad}
                  label={g.label}
                />
              ))
            }
          </div>
        </section>

        {/* Datos secundarios */}
        <section>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Temperatura', valor: ultima?.temperatura, unidad: '°C', icon: '🌡' },
              { label: 'Humedad', valor: ultima?.humedad, unidad: '%', icon: '💧' },
              { label: 'PM10', valor: ultima?.pM10, unidad: 'µg/m³', icon: '🌫' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-200 px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
                <span className="text-lg sm:text-2xl">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.label}</p>
                  <p className="text-base sm:text-xl font-bold text-gray-800 transition-all duration-300">
                    {item.valor != null ? Math.round(item.valor * 10) / 10 : '--'}
                    <span className="text-[10px] sm:text-sm font-normal text-gray-400 ml-0.5 sm:ml-1">{item.unidad}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">Historial</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={async () => {
                  setGenerando(true);
                  try { await simularHistorial(288); } catch {}
                  setGenerando(false);
                }}
                disabled={generando}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {generando ? 'Generando...' : 'Simular historial'}
              </button>
              <SelectorRango horasActual={horas} onChange={setHoras} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4">
            <GraficaHistorial horas={horas} />
          </div>
        </section>

        {/* Mapa de calor + Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Mapa de calor</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
              <MapaCalor />
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Alertas recientes</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
              <TablaAlertas />
            </div>
          </section>
        </div>

        {/* Panel de control */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Panel de control</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <PanelControl />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-gray-400">
          Prácticas Profesionales — Ingeniería Física — UGTO 2026
        </div>
      </footer>
    </div>
  );
}
