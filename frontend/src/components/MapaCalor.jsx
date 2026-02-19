import { useState, useEffect } from 'react';
import { getMediciones } from '../services/api';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const VARIABLES = [
  { key: 'pM25', label: 'PM2.5', max: 60 },
  { key: 'cO2', label: 'CO₂', max: 1500 },
];

function intensidadColor(valor, max) {
  if (valor == null) return '#f9fafb';
  const ratio = Math.min(valor / max, 1);
  if (ratio < 0.33) return `rgb(${Math.round(34 + ratio * 3 * 180)}, ${Math.round(197 - ratio * 3 * 40)}, ${Math.round(94 - ratio * 3 * 50)})`;
  if (ratio < 0.66) return `rgb(${Math.round(234)}, ${Math.round(179 - (ratio - 0.33) * 3 * 100)}, ${Math.round(8)})`;
  return `rgb(${Math.round(239)}, ${Math.round(68)}, ${Math.round(68)})`;
}

export default function MapaCalor() {
  const [datos, setDatos] = useState({});
  const [variable, setVariable] = useState(VARIABLES[0]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const mediciones = await getMediciones(168);
        const agrupado = {};

        for (const m of mediciones) {
          const d = new Date(m.timestamp);
          const dia = (d.getDay() + 6) % 7; // Lun=0 ... Dom=6
          const hora = d.getHours();
          const key = `${dia}-${hora}`;
          if (!agrupado[key]) agrupado[key] = [];
          agrupado[key].push(m);
        }

        const promedios = {};
        for (const [key, arr] of Object.entries(agrupado)) {
          const result = {};
          for (const v of VARIABLES) {
            const sum = arr.reduce((s, m) => s + (m[v.key] ?? 0), 0);
            result[v.key] = Math.round((sum / arr.length) * 10) / 10;
          }
          promedios[key] = result;
        }

        setDatos(promedios);
      } catch {}
    };

    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {VARIABLES.map((v) => (
          <button
            key={v.key}
            onClick={() => setVariable(v)}
            className={`text-xs px-2.5 py-1 rounded-lg transition ${
              variable.key === v.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[10px] text-gray-400 w-8"></th>
              {DIAS.map((d) => (
                <th key={d} className="text-[10px] text-gray-500 font-medium pb-1">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td className="text-[10px] text-gray-400 text-right pr-1.5 font-mono">{String(hora).padStart(2, '0')}</td>
                {DIAS.map((_, dia) => {
                  const key = `${dia}-${hora}`;
                  const val = datos[key]?.[variable.key];
                  return (
                    <td key={dia} className="p-0.5">
                      <div
                        className="w-full h-4 rounded-sm"
                        style={{ backgroundColor: intensidadColor(val, variable.max) }}
                        title={val != null ? `${DIAS[dia]} ${hora}:00 — ${variable.label}: ${val}` : 'Sin datos'}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-2 mt-2 justify-center">
        <span className="text-[10px] text-gray-400">Bajo</span>
        <div className="flex h-2.5 rounded overflow-hidden">
          {['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'].map((c) => (
            <div key={c} className="w-6" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400">Alto</span>
      </div>
    </div>
  );
}
