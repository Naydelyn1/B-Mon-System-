import type { StaticImageData } from 'next/image';

// Imagen de la mitad izquierda del login (y de recuperar/restablecer contraseña).
// Para usar la tuya:
//   1. Copia la imagen a src/assets/login/ (jpg o png, idealmente vertical y de 1200 px o más).
//   2. Cambia este archivo así:
//        import foto from '@/assets/login/login.jpg';
//        export const loginImagen: StaticImageData | null = foto;
// Con null se muestra el fondo tech sin imagen.
export const loginImagen: StaticImageData | null = null;
