import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from '@clerk/clerk-react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Navbar from './components/NavBar';
import Home from './pages/Home';
import Create from './pages/Create';
import Edit from './pages/Edit';
import { ReactNode } from 'react';

// Inicializar Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

/**
 * Tipado de propiedades del layout
 */
interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal de la aplicación
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Mi Catálogo de Películas. Powered by React, Convex & Clerk.</p>
        </div>
      </footer>
    </div>
  );
};

/**
 * Rutas protegidas - Solo accesibles para usuarios autenticados
 */
const ProtectedRoutes: React.FC = () => {
  return (
    <>
      <SignedIn>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

/**
 * Componente principal de la aplicación
 */
const App: React.FC = () => {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Configuración</h1>
          <p className="text-gray-700">
            La variable de entorno VITE_CLERK_PUBLISHABLE_KEY no está configurada.
            Por favor, revisa tu archivo .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProvider client={convex}>
        <Router>
          <Routes>
            {/* Rutas de autenticación */}
            <Route
              path="/sign-in/*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/" />
                </div>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/" />
                </div>
              }
            />

            {/* Rutas protegidas */}
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </ConvexProvider>
    </ClerkProvider>
  );
};

export default App;

