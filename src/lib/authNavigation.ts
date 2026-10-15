/** Keep the intended in-app destination through login and registration. */
export function authPath(mode: 'login' | 'register', returnTo?: string | null) {
  return returnTo ? `/${mode}?next=${encodeURIComponent(returnTo)}` : `/${mode}`
}

function isInternalPath(path: string | null | undefined): path is string {
  return !!path && /^\/(?!\/)/.test(path) && !/[\\\u0000-\u001f\u007f]/.test(path)
}

export function authDestination(next: string | null, role: 'ADMIN' | 'STUDENT') {
  if (isInternalPath(next) && (role === 'ADMIN' || !next.startsWith('/admin'))) return next
  return role === 'ADMIN' ? '/admin/users' : '/dashboard'
}

export function isLessonDestination(path: string | null) {
  return isInternalPath(path) && /^\/(?:lesson\/|capstone\/(?:lessons|preview)\/)/.test(path)
}
