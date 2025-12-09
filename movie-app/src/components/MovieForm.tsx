import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Save, X, Loader2 } from 'lucide-react';
import { usePoster } from '../hooks/usePoster';

export interface MovieFormData {
  titulo: string;
  genero: string;
  anio: number;
  director: string;
  poster: string;
}

interface MovieFormErrors {
  titulo?: string;
  genero?: string;
  anio?: string;
  director?: string;
}

interface MovieFormProps {
  initialData?: Partial<MovieFormData> | null;
  onSubmit: (data: MovieFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Formulario para crear/editar películas
 * Incluye búsqueda automática de posters desde OMDb
 */
const MovieForm: React.FC<MovieFormProps> = ({
  initialData = null,
  onSubmit,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const {
    loading: posterLoading,
    error: posterError,
    searchPoster,
    reset: resetPoster,
  } = usePoster();

  // Estado del formulario
  const [formData, setFormData] = useState<MovieFormData>({
    titulo: '',
    genero: '',
    anio: new Date().getFullYear(),
    director: '',
    poster: '',
  });

  const [errors, setErrors] = useState<MovieFormErrors>({});
  const [posterSearched, setPosterSearched] = useState(false);

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        genero: initialData.genero || '',
        anio: initialData.anio ?? new Date().getFullYear(),
        director: initialData.director || '',
        poster: initialData.poster || '',
      });

      setPosterSearched(!!initialData.poster);
    }
  }, [initialData]);

  // Manejo de cambios en inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'anio'
          ? Number(value) || new Date().getFullYear()
          : value,
    }));

    // Limpiar error del campo
    if (errors[name as keyof MovieFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Buscar poster en OMDb
  const handleSearchPoster = async () => {
    if (!formData.titulo.trim()) {
      setErrors(prev => ({
        ...prev,
        titulo: 'Ingresa un título para buscar',
      }));
      return;
    }

    const result = await searchPoster(formData.titulo);

    if (result && result.poster) {
      setFormData((prev) => ({
        ...prev,
        poster: result.poster ?? '',
        genero: prev.genero || result.genre || prev.genero,
        anio: prev.anio || (result.year ? parseInt(result.year) : prev.anio),
        director: prev.director || result.director || prev.director,
      }));
      setPosterSearched(true);
    }
  };

// Validar formulario
const validateForm = (): boolean => {
  const newErrors: MovieFormErrors = {};

  if (!formData.titulo.trim()) {
    newErrors.titulo = 'El título es obligatorio';
  }

  if (!formData.genero.trim()) {
    newErrors.genero = 'El género es obligatorio';
  }

  if (
    !formData.anio ||
    formData.anio < 1800 ||
    formData.anio > new Date().getFullYear() + 5
  ) {
    newErrors.anio = 'Ingresa un año válido';
  }

  if (!formData.director.trim()) {
    newErrors.director = 'El director es obligatorio';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Submit del formulario
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    await onSubmit(formData);
  } catch (error: any) {
    console.error('Error en submit:', error);
    alert(error?.message || 'Error al guardar la película');
  }
};

return (
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Título */}
    <div>
      <label
        htmlFor="titulo"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Título de la Película *
      </label>

      <div className="flex space-x-2">
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.titulo ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Ej: The Shawshank Redemption"
        />

        <button
          type="button"
          onClick={handleSearchPoster}
          disabled={posterLoading || !formData.titulo.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          title="Buscar poster en OMDb"
        >
          {posterLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">Buscar Poster</span>
        </button>
      </div>

      {errors.titulo && (
        <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
      )}
      {posterError && (
        <p className="mt-1 text-sm text-amber-600">{posterError}</p>
      )}
    </div>

    {/* Preview del Poster */}
    {formData.poster && (
      <div className="flex justify-center">
        <div className="relative inline-block">
          <img
            src={formData.poster}
            alt="Poster preview"
            className="w-48 h-72 object-cover rounded-lg shadow-lg"
            onError={() =>
              setFormData(prev => ({ ...prev, poster: '' }))
            }
          />

          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, poster: '' }));
              setPosterSearched(false);
              resetPoster();
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Quitar poster"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}

    {/* Género */}
    <div>
      <label
        htmlFor="genero"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Género *
      </label>
      <input
        type="text"
        id="genero"
        name="genero"
        value={formData.genero}
        onChange={handleChange}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.genero ? 'border-red-500' : 'border-gray-300'
          }`}
        placeholder="Ej: Drama, Acción, Comedia"
      />
      {errors.genero && (
        <p className="mt-1 text-sm text-red-600">{errors.genero}</p>
      )}
    </div>

    {/* Año */}
    <div>
      <label
        htmlFor="anio"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Año *
      </label>
      <input
        type="number"
        id="anio"
        name="anio"
        value={formData.anio}
        onChange={handleChange}
        min="1800"
        max={new Date().getFullYear() + 5}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.anio ? 'border-red-500' : 'border-gray-300'
          }`}
      />
      {errors.anio && (
        <p className="mt-1 text-sm text-red-600">{errors.anio}</p>
      )}
    </div>

    {/* Director */}
    <div>
      <label
        htmlFor="director"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Director *
      </label>
      <input
        type="text"
        id="director"
        name="director"
        value={formData.director}
        onChange={handleChange}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.director ? 'border-red-500' : 'border-gray-300'
          }`}
        placeholder="Ej: Frank Darabont"
      />
      {errors.director && (
        <p className="mt-1 text-sm text-red-600">{errors.director}</p>
      )}
    </div>

    {/* Botones */}
    <div className="flex space-x-4 pt-4">
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>{initialData ? 'Actualizar' : 'Crear'} Película</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        disabled={isLoading}
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
      >
        Cancelar
      </button>
    </div>
  </form>
);
};

export default MovieForm;
