import type { StaticImageData } from 'next/image';
import pharmacoreProductos from '@/assets/sistemas/pharmacore-productos.jpg';
import pawsoftTienda from '@/assets/sistemas/pawsoft-tienda.jpg';
import gymflowDashboard from '@/assets/sistemas/gymflow-dashboard.jpg';

export interface Captura {
  src: StaticImageData;
  /** Qué se ve en la captura, para lectores de pantalla. */
  alt: string;
}

// Capturas reales de cada sistema, sin datos de personas (nombres y fotos pixelados).
// Proporción 1.95:1 a 1600 px de ancho, igual que el marco del catálogo.
// Para añadir una: copia la imagen a src/assets/sistemas/ e impórtala aquí, por ejemplo:
//   import pharmacoreVentas from '@/assets/sistemas/pharmacore-ventas.jpg';
//   pharmacore: [{ src: pharmacoreVentas, alt: 'Pantalla de nueva venta en PharmaCore' }],
// Un sistema sin capturas muestra su mockup en el catálogo.
export const capturas: Partial<Record<'pharmacore' | 'pawsoft' | 'gymflow' | 'medida', Captura[]>> = {
  pharmacore: [
    {
      src: pharmacoreProductos,
      alt: 'PharmaCore: lista de productos de farmacia con categoría, precio, stock mínimo y estado',
    },
  ],
  pawsoft: [
    {
      src: pawsoftTienda,
      alt: 'PawSoft: tienda e inventario con productos veterinarios, precios, stock y botón para agregar al carrito',
    },
  ],
  gymflow: [
    {
      src: gymflowDashboard,
      alt: 'GymFlow: panel con socios activos, ingresos del mes, pagos pendientes y accesos rápidos',
    },
  ],
};
