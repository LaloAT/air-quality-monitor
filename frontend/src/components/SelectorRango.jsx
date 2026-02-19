const RANGOS = [
  { label: '1h', horas: 1 },
  { label: '6h', horas: 6 },
  { label: '24h', horas: 24 },
  { label: '7d', horas: 168 },
];

export default function SelectorRango({ horasActual, onChange }) {
  return (
    <div className="flex gap-1.5">
      {RANGOS.map((r) => (
        <button
          key={r.horas}
          onClick={() => onChange(r.horas)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
            horasActual === r.horas
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
