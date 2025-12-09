import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import Navbar from './components/NavBar'
import Home from './pages/Home'
import Create from './pages/Create'
import EditPage from './pages/Edit'

// Inicializar Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

/**
 * Layout principal de la aplicación
 */
interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Mi Catálogo de Películas. Powered by React 19, Convex & Clerk.</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * Rutas protegidas - Solo accesibles para usuarios autenticados
 */
const ProtectedRoutes = () => {
  return (
    <>
      <SignedIn>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/edit/:id" element={<EditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

/**
 * Componente principal de la aplicación
 */
const App = () => {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>

        <Routes>
          {/* Rutas de autenticación */}
          <Route
            path="/sign-in/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                />
              </div>
            }
          />

          <Route
            path="/sign-up/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                />
              </div>
            }
          />

          {/* Rutas protegidas */}
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>

      </BrowserRouter>
    </ConvexProvider>
  )
}

export default App
