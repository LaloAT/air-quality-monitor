import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/auth';

export default function Dashboard() {
  const navigate = useNavigate();

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
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Gauges placeholder */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Medidores en tiempo real</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['PM2.5', 'CO₂', 'TVOC'].map((label) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-32 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-gray-400 text-sm">Gauge {label}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
              </div>
            ))}
          </div>
        </section>

        {/* Charts placeholder */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Historial</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Gráfica de historial — Fase 7</span>
            </div>
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
