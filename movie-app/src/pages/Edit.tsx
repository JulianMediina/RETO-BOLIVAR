import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import MovieForm from '../components/MovieForm'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'
import type { MovieFormData } from '../types'

/**
 * Página para editar una película existente
 */
const EditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  // Obtener la película a editar
  const movie = useQuery(
    api.movies.getMovie,
    user && id ? { id: id as Id<"movies">, userId: user.id } : 'skip'
  )

  // Mutation para actualizar película
  const updateMovie = useMutation(api.movies.updateMovie)

  // Verificar si el ID es válido
  useEffect(() => {
    if (!id) {
      navigate('/')
    }
  }, [id, navigate])

  // Manejar submit del formulario
  const handleSubmit = async (formData: MovieFormData) => {
    if (!user || !id) {
      alert('Error: Datos incompletos')
      return
    }

    setIsLoading(true)

    try {
      await updateMovie({
        id: id as Id<"movies">,
        userId: user.id,
        titulo: formData.titulo,
        genero: formData.genero,
        anio: formData.anio,
        director: formData.director,
        poster: formData.poster || undefined,
      })

      // Redirigir al home
      navigate('/')
    } catch (error) {
      console.error('Error al actualizar película:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar la película')
      setIsLoading(false)
    }
  }

  // Loading state
  if (movie === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando película...</p>
        </div>
      </div>
    )
  }

  // Si no se encuentra la película
  if (!movie) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Película no encontrada
          </h2>
          <p className="text-red-600 mb-4">
            La película que buscas no existe o no tienes permisos para editarla.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Volver al catálogo</span>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Edit className="size-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Editar Película
              </h1>
              <p className="text-gray-600">
                Modifica la información de "{movie.titulo}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <MovieForm
          initialData={movie}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default EditPage