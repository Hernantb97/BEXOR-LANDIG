import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Continuar con la solicitud normalmente
  return NextResponse.next();
}

// Configurar las rutas en las que el middleware debe ejecutarse
export const config = {
  matcher: [
    // Aplicar a todas las rutas
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 