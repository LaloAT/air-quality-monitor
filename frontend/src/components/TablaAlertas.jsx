import { useState, useEffect } from 'react';
import { getAlertas } from '../services/api';

function formatFecha(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TablaAlertas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAlertas(24);
        setAlertas(data.slice(0, 20));
      } catch {}
    };

    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (alertas.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Sin alertas recientes ✅
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-80">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 font-medium">Fecha</th>
            <th className="pb-2 font-medium">Variable</th>
            <th className="pb-2 font-medium text-right">Valor</th>
            <th className="pb-2 font-medium text-right">Umbral</th>
          </tr>
        </thead>
        <tbody>
          {alertas.map((a) => (
            <tr key={a.id} className="border-b border-gray-50 hover:bg-red-50 transition">
              <td className="py-2 text-gray-500 text-xs">{formatFecha(a.timestamp)}</td>
              <td className="py-2 font-medium text-gray-700">{a.variable}</td>
              <td className="py-2 text-right text-red-600 font-semibold">{a.valor}</td>
              <td className="py-2 text-right text-gray-400">{a.umbral}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
