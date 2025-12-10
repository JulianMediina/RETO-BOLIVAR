import { useState } from 'react'
import { Link } from 'react-router'
import { Edit, Trash2, User, Film, Star, MoreVertical } from 'lucide-react'
import type { MovieCardProps } from '../types'

/**
 * Tarjeta de película individual
 * Muestra la información de una película con opciones de editar/eliminar
 */
const MovieCard = ({ movie, onDelete }: MovieCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${movie.titulo}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(movie._id)
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar la película')
      setIsDeleting(false)
    }
  }

  // Poster por defecto con diseño mejorado
  const defaultPoster = `https://placehold.co/300x450/1e40af/ffffff?text=${encodeURIComponent(movie.titulo.substring(0, 15))}`
  const posterUrl = (movie.poster && !imageError) ? movie.poster : defaultPoster

  // Calcular un rating aleatorio para demostración
  const randomRating = (Math.random() * 3 + 2).toFixed(1)

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 animate-fade-in">
      {/* Poster con efecto de gradiente */}
      <div className="relative overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 aspect-2/3">
        <img
          src={posterUrl}
          alt={`Poster de ${movie.titulo}`}
          className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Rating badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full">
          <Star className="size-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{randomRating}</span>
        </div>

        {/* Botones de acción en hover */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300"
          >
            <MoreVertical className="size-4 text-white" />
          </button>
          
          {/* Menú de acciones desplegable */}
          {showActions && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 animate-scale-in">
              <Link
                to={`/edit/${movie._id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                onClick={() => setShowActions(false)}
              >
                <Edit className="size-4 text-blue-600" />
                <span className="text-sm font-medium">Editar película</span>
              </Link>
              
              <button
                onClick={() => {
                  setShowActions(false)
                  handleDelete()
                }}
                disabled={isDeleting}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-gray-700 w-full disabled:opacity-50"
              >
                <Trash2 className="size-4 text-red-600" />
                <span className="text-sm font-medium">
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Overlay con botones principales al hacer hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 p-6">
          <h3 className="text-white text-xl font-bold text-center mb-2 line-clamp-2">
            {movie.titulo}
          </h3>
          
          <div className="flex items-center gap-4">
            <Link
              to={`/edit/${movie._id}`}
              className="p-4 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
              title="Editar película"
            >
              <Edit className="size-5 text-white" />
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-4 bg-linear-to-r from-red-500 to-red-600 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg disabled:opacity-50"
              title="Eliminar película"
            >
              {isDeleting ? (
                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="size-5 text-white" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Información */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 pr-2">
            {movie.titulo}
          </h3>
          
          <span className="px-2 py-1 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap">
            {movie.anio}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Film className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Género</p>
              <p className="text-sm text-gray-800 font-medium line-clamp-1">{movie.genero}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <User className="size-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Director</p>
              <p className="text-sm text-gray-800 font-medium line-clamp-1">{movie.director}</p>
            </div>
          </div>
        </div>

        {/* Botones mobile */}
        <div className="flex gap-3 mt-5 sm:hidden">
          <Link
            to={`/edit/${movie._id}`}
            className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-center text-sm font-bold flex items-center justify-center gap-2"
          >
            <Edit className="size-4" />
            <span>Editar</span>
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>

        {/* Indicador de estado */}
        {isDeleting && (
          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs text-red-600 text-center font-medium">
              Eliminando película...
            </p>
          </div>
        )}
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </div>
  )
}

export default MovieCard