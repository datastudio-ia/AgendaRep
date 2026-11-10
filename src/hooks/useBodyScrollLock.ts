import { useEffect } from 'react';

/**
 * Hook reutilizable para bloquear el scroll del fondo (document.body)
 * mientras una ventana o modal esté abierta.
 * 
 * 1. Al montarse / abrirse el modal: añade la clase 'overflow-hidden' a document.body y document.documentElement.
 * 2. Al desmontarse / cerrarse el modal: remueve la clase 'overflow-hidden'.
 */
export function useBodyScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;

    document.body.classList.add('overflow-hidden');
    document.documentElement.classList.add('overflow-hidden');

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isLocked]);
}
