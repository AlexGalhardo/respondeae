import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDangerMode = process.env.DANGER_MODE === 'true';

  // Se está em modo de perigo
  if (isDangerMode) {
    // Lista de caminhos permitidos durante manutenção
    const allowedPaths = [
      '/offline',
      '/_next',
      '/favicon.ico',
      '/api/health'
    ];
    
    // Verificar se o caminho atual é permitido
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
    
    // Se não for permitido, redirecionar para /offline
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/offline', request.url));
    }
  } 
  // Se NÃO está em modo de perigo, bloquear acesso à página /offline
  else if (pathname.startsWith('/offline')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};