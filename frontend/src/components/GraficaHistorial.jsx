import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getMediciones } from '../services/api';

const LINEAS = [
  { key: 'pM25', name: 'PM2.5', color: '#ef4444' },
  { key: 'cO2', name: 'CO₂', color: '#f97316' },
  { key: 'tvoc', name: 'TVOC', color: '#8b5cf6' },
];

function formatHora(timestamp) {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{new Date(d.timestamp).toLocaleString()}</p>
      <p style={{ color: '#ef4444' }}>PM2.5: <b>{d.pM25}</b> µg/m³</p>
      <p style={{ color: '#f97316' }}>CO₂: <b>{d.cO2}</b> ppm</p>
      <p style={{ color: '#8b5cf6' }}>TVOC: <b>{d.tvoc}</b> ppb</p>
      <p className="text-gray-500">Temp: {d.temperatura}°C · Hum: {d.humedad}%</p>
    </div>
  );
}

export default function GraficaHistorial({ horas }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      const data = await getMediciones(horas);
      setDatos(data);
    } catch {
      // silenciar — el dashboard maneja auth errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDatos();
    const interval = setInterval(fetchDatos, 30000);
    return () => clearInterval(interval);
  }, [horas]);

  if (loading && datos.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
        Cargando datos...
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
        Sin datos para este rango. Usa el simulador para generar historial.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <LineChart data={datos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatHora}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="line"
        />
        {LINEAS.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
