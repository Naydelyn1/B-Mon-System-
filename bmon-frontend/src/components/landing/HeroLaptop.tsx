'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

// Colores de sintaxis
const C = {
  c: 'text-white/40', // comentario
  d: 'text-yellow-300', // decorador
  k: 'text-purple-300', // palabra clave
  t: 'text-orange', // tipo / clase
  f: 'text-tech', // función
  s: 'text-green-300', // texto
  p: 'text-white/85', // resto
} as const;

type Token = [keyof typeof C, string];

// Código ilustrativo (no es de ningún cliente)
const CODIGO: Token[][] = [
  [['c', '// sistema.service.ts']],
  [['d', '@Injectable'], ['p', '()']],
  [['k', 'export class '], ['t', 'SistemaService'], ['p', ' {']],
  [['p', '  '], ['k', 'async '], ['f', 'crearVenta'], ['p', '(dto: '], ['t', 'VentaDto'], ['p', ') {']],
  [['p', '    '], ['k', 'const '], ['p', 'venta = '], ['k', 'await '], ['p', 'this.ventas.'], ['f', 'save'], ['p', '(dto);']],
  [['p', '    '], ['k', 'await '], ['p', 'this.sunat.'], ['f', 'emitirComprobante'], ['p', '(venta);']],
  [['p', '    this.'], ['f', 'notificar'], ['p', '('], ['s', "'venta.creada'"], ['p', ', venta);']],
  [['p', '    '], ['k', 'return '], ['p', 'venta;']],
  [['p', '  }']],
  [['p', '}']],
];

const TERMINAL = [
  { texto: '$ npm run deploy', clase: 'text-white/80' },
  { texto: '✓ build listo · pruebas ok', clase: 'text-green-400' },
  { texto: '● sistema en línea', clase: 'text-tech' },
];

const largoLinea = (l: Token[]) => l.reduce((n, [, v]) => n + v.length, 0);

/** Laptop con un editor que escribe código y luego "despliega"; se repite. */
export function HeroLaptop({ start }: { start: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const enVista = useInView(ref, { amount: 0.3 });
  const activo = start && enVista && !reduce;

  const largos = useMemo(() => CODIGO.map(largoLinea), []);
  const total = largos.reduce((a, b) => a + b, 0);
  const texto = useMemo(() => CODIGO.map((l) => l.map(([, v]) => v).join('')).join(''), []);

  const [n, setN] = useState(0); // caracteres escritos
  const [term, setTerm] = useState(0); // líneas de terminal visibles

  // Con movimiento reducido: todo visible desde el inicio (tras montar, para no romper la hidratación)
  useEffect(() => {
    if (reduce) {
      setN(total);
      setTerm(TERMINAL.length);
    }
  }, [reduce, total]);

  useEffect(() => {
    if (!activo) return;
    let espera: number;
    let siguiente: () => void;
    if (n < total) {
      // Pausa corta al terminar cada línea; los espacios iniciales van rápido
      let acumulado = 0;
      let finDeLinea = false;
      for (const largo of largos) {
        acumulado += largo;
        if (n <= acumulado) {
          finDeLinea = n === acumulado && n > 0;
          break;
        }
      }
      const proximo = texto[n];
      espera = finDeLinea ? 200 : proximo === ' ' ? 8 : 16 + Math.random() * 20;
      siguiente = () => setN((v) => v + 1);
    } else if (term < TERMINAL.length) {
      espera = term === 0 ? 700 : 550;
      siguiente = () => setTerm((v) => v + 1);
    } else {
      espera = 3800;
      siguiente = () => {
        setN(0);
        setTerm(0);
      };
    }
    const id = window.setTimeout(siguiente, espera);
    return () => window.clearTimeout(id);
  }, [activo, n, term, total, largos, texto]);

  // Reparte los caracteres escritos entre las líneas y tokens
  let restante = n;
  // El cursor queda al final de la línea durante la pausa y pasa a la siguiente al escribir
  const lineaCursor = (() => {
    let acc = 0;
    for (let i = 0; i < largos.length; i++) {
      acc += largos[i];
      if (n <= acc) return i;
    }
    return largos.length - 1;
  })();
  const escribiendo = n < total;

  return (
    <div ref={ref} className="w-full max-w-xl" aria-hidden>
      {/* Pantalla */}
      <div className="relative rounded-t-2xl border border-white/10 bg-[#070b14] p-2.5 pb-3 shadow-2xl shadow-tech/10">
        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20" />
        <div className="rounded-md overflow-hidden border border-tech/20 bg-[#0d1424] font-mono text-[11px] xl:text-[12.5px] leading-[1.7]">
          {/* Barra del editor */}
          <div className="flex items-center gap-3 px-3 h-8 border-b border-white/5 bg-[#0a101d]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
            <span className="px-2.5 py-1 rounded-t bg-[#0d1424] text-white/80 border-b-2 border-tech">sistema.service.ts</span>
            <span className="text-white/35 hidden xl:inline">venta.dto.ts</span>
          </div>

          {/* Código */}
          <div className="flex px-1 py-3 min-h-[17.5em]">
            <div className="select-none text-right pr-3 pl-2 text-white/20">
              {CODIGO.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 whitespace-pre overflow-hidden">
              {CODIGO.map((linea, i) => {
                const tokens: ReactNode[] = [];
                linea.forEach(([tipo, valor], j) => {
                  if (restante <= 0) return;
                  const parte = valor.slice(0, restante);
                  restante -= parte.length;
                  tokens.push(
                    <span key={j} className={C[tipo]}>
                      {parte}
                    </span>,
                  );
                });
                return (
                  <div key={i} className={i === lineaCursor && escribiendo ? 'bg-white/[0.03]' : undefined}>
                    {tokens}
                    {i === lineaCursor && escribiendo && (
                      <span className="inline-block w-[0.55em] h-[1.1em] -mb-[0.2em] bg-tech animate-blink" />
                    )}
                    {'​'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal */}
          <div className="border-t border-white/5 bg-[#080d18] px-4 py-2.5 min-h-[6.6em]">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">terminal</p>
            {TERMINAL.slice(0, term).map((l) => (
              <p key={l.texto} className={l.clase}>
                {l.texto}
              </p>
            ))}
            {!escribiendo && term < TERMINAL.length && (
              <span className="inline-block w-[0.55em] h-[1.1em] bg-white/60 animate-blink" />
            )}
          </div>

          {/* Barra de estado */}
          <div className="flex items-center justify-between px-3 h-6 bg-tech/10 text-tech/80 text-[10px]">
            <span>● main</span>
            <span>TypeScript · UTF-8</span>
          </div>
        </div>
      </div>
      {/* Base */}
      <div className="relative -mx-[7%] h-3.5 rounded-b-2xl bg-gradient-to-b from-[#2b3650] to-[#121a2a] shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-1.5 rounded-b-md bg-black/40" />
      </div>
    </div>
  );
}
