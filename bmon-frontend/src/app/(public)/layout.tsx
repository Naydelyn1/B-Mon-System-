import { MotionProvider } from '@/components/MotionProvider';
import { SmoothScroll } from '@/components/SmoothScroll';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <SmoothScroll />
      {children}
    </MotionProvider>
  );
}
