import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Search, Save, X, Loader2, Film, Calendar, User, Tag } from 'lucide-react'
import { usePoster } from '../hooks/usePoster'
import type { MovieFormProps, MovieFormData } from '../types'

/**
 * Formulario para crear/editar películas
 * Incluye búsqueda automática de posters desde OMDb
 */
const MovieForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false 
}: MovieFormProps) => {
  const navigate = useNavigate()
  const { 
    loading: posterLoading,
    error: posterError,
    posterData,
    searchPoster,
    reset: resetPoster
  } = usePoster()
  
  // Estado del formulario
  const [formData, setFormData] = useState<MovieFormData>({
    titulo: '',
    genero: '',
    anio: new Date().getFullYear(),
    director: '',
    poster: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof MovieFormData, string>>>({})
  const [posterSearched, setPosterSearched] = useState(false)

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        genero: initialData.genero || '',
        anio: initialData.anio || new Date().getFullYear(),
        director: initialData.director || '',
        poster: initialData.poster || '',
      })
      setPosterSearched(!!initialData.poster)
    }
  }, [initialData])

  // Manejo de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'anio' ? parseInt(value) || '' : value
    }))
    
    if (errors[name as keyof MovieFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Buscar poster en OMDb
  const handleSearchPoster = async () => {
    if (!formData.titulo.trim()) {
      setErrors(prev => ({ ...prev, titulo: 'Ingresa un título para buscar' }))
      return
    }

    const result = await searchPoster(formData.titulo)
    
    if (result?.poster) {
      setFormData(prev => ({
        ...prev,
        poster: result.poster || '',
        genero: prev.genero || result.genre || prev.genero,
        anio: prev.anio || parseInt(result.year || '') || prev.anio,
        director: prev.director || result.director || prev.director,
      }))
      setPosterSearched(true)
    } else {
      setPosterSearched(true)
    }
  }

  // Validación
  const validateForm = () => {
    const newErrors: Partial<Record<keyof MovieFormData, string>> = {}

    if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio'
    if (!formData.genero.trim()) newErrors.genero = 'El género es obligatorio'
    if (!formData.anio || formData.anio < 1800 || formData.anio > new Date().getFullYear() + 5) {
      newErrors.anio = 'Ingresa un año válido'
    }
    if (!formData.director.trim()) newErrors.director = 'El director es obligatorio'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error en submit:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar la película')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg">
            <Film className="size-6 text-blue-600" />
          </div>
          <div>
            <label htmlFor="titulo" className="block text-xl font-bold text-gray-800 mb-1">
              Título de la Película *
            </label>
            <p className="text-sm text-gray-600">Busca automáticamente el poster desde OMDb</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`w-full px-5 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-800 placeholder-gray-400 ${
                errors.titulo ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Ej: The Shawshank Redemption"
            />
          </div>

          <button
            type="button"
            onClick={handleSearchPoster}
            disabled={posterLoading || !formData.titulo.trim()}
            className="px-5 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-md font-medium min-w-[140px] justify-center"
          >
            {posterLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Search className="size-5" />
            )}
            <span className="hidden sm:inline">Buscar Poster</span>
            <span className="sm:hidden">Buscar</span>
          </button>
        </div>

        {errors.titulo && (
          <p className="mt-3 ml-1 text-sm text-red-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {errors.titulo}
          </p>
        )}

        {posterError && (
          <p className="mt-3 ml-1 text-sm text-amber-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            {posterError}
          </p>
        )}

        {/* Información del poster encontrado */}
        {posterData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Título encontrado:</p>
                <p className="font-bold text-gray-900">{posterData.title}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Año:</p>
                <p className="font-bold text-gray-900">{posterData.year}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Género:</p>
                <p className="font-bold text-gray-900">{posterData.genre}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Director:</p>
                <p className="font-bold text-gray-900">{posterData.director}</p>
              </div>
            </div>
          </div>
        )}

        {/* Si buscó pero no hay poster */}
        {posterSearched && !formData.poster && !posterError && !posterLoading && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              No se encontró un póster para este título. Puedes agregar uno manualmente más tarde.
            </p>
          </div>
        )}
      </div>

      {/* Preview del Poster */}
      {formData.poster && (
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-200 to-indigo-200 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-300"></div>
            <div className="relative">
              <img
                src={formData.poster}
                alt="Poster preview"
                className="w-56 h-80 object-cover rounded-xl shadow-xl border-2 border-white"
                onError={() => setFormData(prev => ({ ...prev, poster: '' }))}
              />

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, poster: '' }))
                  setPosterSearched(false)
                  resetPoster()
                }}
                className="absolute -top-3 -right-3 p-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                title="Quitar poster"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campos del formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Género */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Tag className="size-5 text-purple-600" />
            </div>
            <label htmlFor="genero" className="block text-sm font-semibold text-gray-700">
              Género *
            </label>
          </div>
          <input
            type="text"
            id="genero"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all text-gray-800 placeholder-gray-400 ${
              errors.genero ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Ej: Drama, Acción, Comedia"
          />
          {errors.genero && (
            <p className="mt-2 ml-1 text-sm text-red-500">{errors.genero}</p>
          )}
        </div>

        {/* Año */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Calendar className="size-5 text-blue-600" />
            </div>
            <label htmlFor="anio" className="block text-sm font-semibold text-gray-700">
              Año *
            </label>
          </div>
          <input
            type="number"
            id="anio"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            min="1800"
            max={new Date().getFullYear() + 5}
            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-800 placeholder-gray-400 ${
              errors.anio ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.anio && (
            <p className="mt-2 ml-1 text-sm text-red-500">{errors.anio}</p>
          )}
        </div>

        {/* Director */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-cyan-50 rounded-lg">
              <User className="size-5 text-cyan-600" />
            </div>
            <label htmlFor="director" className="block text-sm font-semibold text-gray-700">
              Director *
            </label>
          </div>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-gray-800 placeholder-gray-400 ${
              errors.director ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Ej: Frank Darabont"
          />
          {errors.director && (
            <p className="mt-2 ml-1 text-sm text-red-500">{errors.director}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-4 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold flex items-center justify-center gap-3 shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="size-5" />
              <span>{initialData ? 'Actualizar' : 'Crear'} Película</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          disabled={isLoading}
          className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium border border-gray-300 hover:border-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default MovieForm