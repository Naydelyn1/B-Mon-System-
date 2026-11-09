import type { StaticImageData } from 'next/image';

export interface Captura {
  src: StaticImageData;
  /** Qué se ve en la captura, para lectores de pantalla. */
  alt: string;
}

// Capturas reales de cada sistema, tomadas con datos de prueba (nunca de clientes reales).
// Para añadir una: copia la imagen a src/assets/sistemas/ e impórtala aquí, por ejemplo:
//   import sysventaVenta from '@/assets/sistemas/sysventa-venta.webp';
//   sysventa: [{ src: sysventaVenta, alt: 'Pantalla de nueva venta en SysVenta' }],
// Un sistema sin capturas muestra su mockup en el catálogo.
export const capturas: Partial<Record<'sysventa' | 'pawsoft' | 'gymflow' | 'medida', Captura[]>> = {};
