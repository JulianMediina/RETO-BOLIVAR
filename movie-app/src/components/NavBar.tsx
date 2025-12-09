import { Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Film, Plus, Home } from 'lucide-react';

/**
 * Barra de navegación principal
 */
const Navbar: React.FC = () => {
  const { user } = useUser();

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white hover:text-primary-100 transition-colors"
          >
            <Film className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">
              Mi Catálogo de Películas
            </span>
            <span className="text-xl font-bold sm:hidden">
              Películas
            </span>
          </Link>

          {/* Navegación central */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            
            <Link
              to="/create"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-white text-primary-600 hover:bg-primary-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nueva Película</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
          </div>

          {/* Usuario */}
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm hidden md:inline">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>

            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
