import { Navigate } from 'react-router-dom'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  return <RedirectToPath path={'/swap'} />
}

// Redirects to swap but only replace the pathname
export function RedirectPathToLimitOnly() {
  return <RedirectToPath path={'/limit'} />
}

export function RedirectToPath({ path }: { path: string }) {
  return <Navigate to={path} />
}
