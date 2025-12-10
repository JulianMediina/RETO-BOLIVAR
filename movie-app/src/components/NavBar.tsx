import { Link } from 'react-router'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Film, Plus, Home, Search } from 'lucide-react'

const Navbar = () => {
  const { user, isLoaded } = useUser()

  return (
    <nav className="sticky top-0 z-50 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md shadow-xl border-b border-gray-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo y título */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-300 group"
          >
            <div className="p-1.5 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 border border-gray-700/50">
              <Film className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight hidden sm:inline-block">
                MovieApp
              </span>
              <span className="text-lg font-bold tracking-tight sm:hidden">
                MA
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">Tu colección de cine</span>
            </div>
          </Link>

          {/* Navegación central */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* INICIO */}
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 text-sm font-medium border border-transparent hover:border-gray-700"
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">Inicio</span>
            </Link>
            <Link
              to="/Catalog"
              className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <Search className="size-5" />
              <span className="hidden sm:inline">Catálogo</span>
            </Link>

            {/* BOTÓN CREAR */}
            <Link
              to="/create"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 
                         text-white hover:from-blue-500 hover:to-purple-500 hover:shadow-lg 
                         transition-all duration-300 text-sm font-bold shadow-md"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nueva Película</span>
              <span className="sm:hidden">Crear</span>
            </Link>
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-3">
            {isLoaded && user && (
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-white text-sm font-medium leading-tight">
                  {user.firstName || 'Usuario'}
                </span>
                <span className="text-gray-400 text-xs truncate max-w-[180px]">
                  {user.emailAddresses[0]?.emailAddress || 'No email'}
                </span>
              </div>
            )}

            <div className="ring-2 ring-gray-600/50 hover:ring-gray-500/70 rounded-full transition-all duration-300 hover:scale-105">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar