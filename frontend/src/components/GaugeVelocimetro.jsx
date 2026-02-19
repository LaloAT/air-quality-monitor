import { useMemo } from 'react';

const CX = 100;
const CY = 100;
const RADIUS = 70;
const STROKE = 28;
const NEEDLE_LEN = RADIUS - STROKE / 2 - 3;

// Semicírculo: de 180° (izquierda) a 0° (derecha)
// Longitud total del arco = PI * RADIUS
const ARC_LENGTH = Math.PI * RADIUS;

// Colores de las 5 zonas (equiespaciadas en el arco)
const ZONAS = [
  { color: '#22c55e' },  // verde
  { color: '#84cc16' },  // amarillo-verde
  { color: '#eab308' },  // amarillo
  { color: '#f97316' },  // naranja
  { color: '#ef4444' },  // rojo
];

// Path del arco semicircular (de izquierda a derecha)
const ARC_PATH = `M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`;

export default function GaugeVelocimetro({ valor, min, max, umbrales, unidad, label }) {
  const clamped = Math.max(min, Math.min(max, valor ?? min));
  const ratio = (clamped - min) / (max - min);

  // Ángulo de rotación de la aguja: 0 ratio = -90° (izquierda), 1 ratio = +90° (derecha)
  const needleRotation = -90 + ratio * 180;

  // Color actual
  const colorActual = useMemo(() => {
    for (const u of umbrales) {
      if (clamped <= u.valor) return u.color;
    }
    return umbrales[umbrales.length - 1].color;
  }, [clamped, umbrales]);

  // Cada zona cubre 1/5 del arco
  const zonaLen = ARC_LENGTH / ZONAS.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col items-center">
      <svg viewBox="0 0 200 125" className="w-full max-w-[230px]">
        {/* Zonas de color — arcos superpuestos con dasharray */}
        {ZONAS.map((zona, i) => (
          <path
            key={i}
            d={ARC_PATH}
            fill="none"
            stroke={zona.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${zonaLen} ${ARC_LENGTH}`}
            strokeDashoffset={-i * zonaLen}
          />
        ))}

        {/* Aguja negra con rotación animada */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${needleRotation}deg)`,
            transition: 'transform 0.8s ease-out',
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - NEEDLE_LEN}
            stroke="#1f2937"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        {/* Círculo base de la aguja */}
        <circle cx={CX} cy={CY} r={6} fill="#1f2937" />
        <circle cx={CX} cy={CY} r={2.5} fill="#9ca3af" />

        {/* Min / Max */}
        <text x={CX - RADIUS - STROKE / 2} y={CY + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">{min}</text>
        <text x={CX + RADIUS + STROKE / 2} y={CY + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">{max}</text>
      </svg>

      {/* Valor */}
      <div className="-mt-2 text-center">
        <span className="text-3xl font-bold" style={{ color: colorActual }}>
          {valor != null ? Math.round(valor * 10) / 10 : '--'}
        </span>
        <span className="text-sm text-gray-400 ml-1">{unidad}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}
