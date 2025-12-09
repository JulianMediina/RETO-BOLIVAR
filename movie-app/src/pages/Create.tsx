import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import MovieForm from '../components/MovieForm'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from 'react-router'
import type { MovieFormData } from '../types'

/**
 * Página para crear una nueva película
 */
const Create = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  // Mutation para crear película
  const createMovie = useMutation(api.movies.createMovie)

  // Manejar submit del formulario
  const handleSubmit = async (formData: MovieFormData) => {
    if (!user) {
      alert('Debes estar autenticado')
      return
    }

    setIsLoading(true)

    try {
      await createMovie({
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
      console.error('Error al crear película:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la película')
      setIsLoading(false)
    }
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
              <Plus className="size-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Nueva Película
              </h1>
              <p className="text-gray-600">
                Agrega una película a tu catálogo personal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <MovieForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          💡 Consejo
        </h3>
        <p className="text-sm text-blue-700">
          Usa el botón "Buscar Poster" para obtener automáticamente la imagen de la película desde OMDb. 
          Si la película no se encuentra, puedes continuar sin poster.
        </p>
      </div>
    </div>
  )
}

export default Create