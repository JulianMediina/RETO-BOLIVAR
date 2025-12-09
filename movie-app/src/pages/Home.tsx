import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import MovieCard from '../components/MovieCard'
import { Loader2, Search, Film, Plus } from 'lucide-react'
import { Link } from 'react-router'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Página principal - Lista de películas del usuario
 */
const Home = () => {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')

  // Obtener películas del usuario
  const movies = useQuery(
    api.movies.listMovies,
    user ? { userId: user.id } : 'skip'
  )

  // Mutation para eliminar películas
  const deleteMovie = useMutation(api.movies.deleteMovie)

  // Manejar eliminación
  const handleDelete = async (movieId: Id<"movies">) => {
    try {
      await deleteMovie({ id: movieId, userId: user!.id })
    } catch (error) {
      console.error('Error al eliminar película:', error)
      throw error
    }
  }

  // Filtrar películas por búsqueda local
  const filteredMovies = movies?.filter(movie =>
    movie.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genero.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading state
  if (movies === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando películas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Film className="size-8 text-primary-500" />
              <span>Mis Películas</span>
            </h1>
            <p className="text-gray-600 mt-1">
              {movies.length} {movies.length === 1 ? 'película' : 'películas'} en tu catálogo
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, director o género..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid de películas */}
      {filteredMovies && filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        // Estado vacío
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Film className="size-16 text-gray-300 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron películas
              </h3>
              <p className="text-gray-500 mb-6">
                No hay películas que coincidan con "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No tienes películas aún
              </h3>
              <p className="text-gray-500 mb-6">
                Comienza agregando tu primera película favorita
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="size-5" />
                <span>Agregar Película</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Home