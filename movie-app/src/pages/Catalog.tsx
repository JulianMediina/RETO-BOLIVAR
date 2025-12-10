import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, Heart, Loader2, Film, X, TrendingUp, ChevronRight } from 'lucide-react'
import { searchMovies, fetchPosterByTitle, type OMDbSearchResult } from '../services/omdb'

// Componente para manejar imágenes con fallback
const MoviePoster = ({ src, alt, title }: { src: string, alt: string, title: string }) => {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    // Generar imagen por defecto basada en el título
    const getDefaultImage = (movieTitle: string) => {
        return `https://placehold.co/600x900/1e40af/ffffff?text=${encodeURIComponent(movieTitle.substring(0, 20))}`
    }

    // Verificar si la URL es válida al montar
    useEffect(() => {
        if (!src || src === 'N/A') {
            setImgSrc(getDefaultImage(title))
            return
        }

        // Pre-cargar imagen para verificar si existe
        const img = new Image()
        img.src = src

        img.onload = () => {
            // Si la imagen carga correctamente, usa la URL original
            setImgSrc(src)
            setHasError(false)
        }

        img.onerror = () => {
            // Si falla, usa la imagen por defecto
            setImgSrc(getDefaultImage(title))
            setHasError(true)
        }

        return () => {
            img.onload = null
            img.onerror = null
        }
    }, [src, title])

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={() => {
                if (!hasError) {
                    setImgSrc(getDefaultImage(title))
                    setHasError(true)
                }
            }}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
        />
    )
}

/**
 * Página de catálogo completo de películas
 * Busca en OMDb y permite agregar a favoritos
 */
const Catalog = () => {
    const { user, isLoaded: isUserLoaded } = useUser()
    const [searchTerm, setSearchTerm] = useState('')
    const [movies, setMovies] = useState<OMDbSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [addingMovie, setAddingMovie] = useState<string | null>(null)
    const [filter] = useState<'all' | 'movie'>('all')
    const [suggestions] = useState<string[]>([
        'The Godfather', 'Inception', 'Pulp Fiction', 'The Dark Knight',
        'Fight Club', 'Forrest Gump', 'The Matrix', 'Interstellar'
    ])
    const [successfullyAdded, setSuccessfullyAdded] = useState<Set<string>>(new Set())

    // Query para verificar si la película ya existe - usando el patrón 'skip' como en Home
    const existingMovies = useQuery(
        api.movies.listMovies,
        user?.id ? { userId: user.id } : 'skip'
    )

    // Mutation para crear película
    const createMovie = useMutation(api.movies.createMovie)

    // Buscar películas en OMDb
    const handleSearch = async (term?: string) => {
        const searchQuery = term || searchTerm
        if (!searchQuery.trim()) {
            setError('Por favor ingresa un término de búsqueda')
            return
        }

        setLoading(true)
        setError(null)
        setMovies([])

        try {
            const results = await searchMovies(searchQuery)

            if (results.length === 0) {
                setError('No se encontraron películas con ese término')
            } else {
                const filteredResults = filter === 'all'
                    ? results
                    : results.filter(movie =>
                        filter === 'movie' ? movie.Type === 'movie' : movie.Type === 'series'
                    )
                setMovies(filteredResults)
            }
        } catch (err) {
            setError('Error al buscar películas. Intenta nuevamente.')
            console.error('Error searching movies:', err)
        } finally {
            setLoading(false)
        }
    }

    // Agregar película a favoritos
    const handleAddToFavorites = async (movie: OMDbSearchResult) => {
        if (!user) {
            alert('Debes estar autenticado para agregar películas')
            return
        }

        // Verificar si ya existe usando el estado local y la query
        const alreadyExists = successfullyAdded.has(movie.imdbID) || 
            existingMovies?.some(m =>
                m.titulo.toLowerCase() === movie.Title.toLowerCase() &&
                m.anio === parseInt(movie.Year)
            )

        if (alreadyExists) {
            alert('Esta película ya está en tu catálogo')
            return
        }

        setAddingMovie(movie.imdbID)

        try {
            // Obtener detalles completos de la película usando fetchPosterByTitle
            const movieDetails = await fetchPosterByTitle(movie.Title)
            
            if (!movieDetails.found) {
                throw new Error('No se pudieron obtener los detalles de la película')
            }

            // Crear la película con toda la información obtenida
            await createMovie({
                userId: user.id,
                titulo: movieDetails.title || movie.Title,
                genero: movieDetails.genre || (movie.Type === 'movie' ? 'Película' : 'Serie'),
                anio: parseInt(movieDetails.year || movie.Year) || new Date().getFullYear(),
                director: movieDetails.director || 'Desconocido',
                poster: movieDetails.poster || (movie.Poster !== 'N/A' ? movie.Poster : ''),
            })

            // Actualizar estado local para reflejar que se agregó exitosamente
            setSuccessfullyAdded(prev => new Set(prev).add(movie.imdbID))

        } catch (err) {
            console.error('Error adding to favorites:', err)
            alert('Error al agregar a favoritos. Intenta nuevamente.')
        } finally {
            setAddingMovie(null)
        }
    }

    // Manejar enter en búsqueda
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Cargar sugerencias populares al inicio
    useEffect(() => {
        if (movies.length === 0 && !searchTerm && isUserLoaded) {
            handleSearch('popular')
        }
    }, [isUserLoaded])

    // Verificar si película ya está en favoritos
    const isMovieInFavorites = (movie: OMDbSearchResult) => {
        return successfullyAdded.has(movie.imdbID) || 
            existingMovies?.some(m =>
                m.titulo.toLowerCase() === movie.Title.toLowerCase() &&
                m.anio === parseInt(movie.Year)
            ) || false
    }

    // Mostrar loading mientras Clerk carga el usuario
    if (!isUserLoaded) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Cargando catálogo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header con gradiente */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

                <div className="relative p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Film className="size-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                                        Catálogo de Películas
                                    </h1>
                                    <p className="text-blue-100">
                                        Descubre y guarda tus películas favoritas
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-white/90 text-sm mt-4">
                                <TrendingUp className="size-4" />
                                <span>+{movies.length || '10k'} películas disponibles</span>
                            </div>
                        </div>

                        {user && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white text-sm font-medium">¡Hola, {user.firstName}!</p>
                                <p className="text-blue-100 text-xs">
                                    Tienes {existingMovies?.length || 0} películas guardadas
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Barra de búsqueda mejorada */}
                    <div className="mt-8 max-w-3xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-6 z-10" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Buscar películas, actores..."
                                className="w-full pl-12 pr-36 py-4 bg-white rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-400 text-lg border border-gray-200"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={loading || !searchTerm.trim()}
                                    className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center gap-2 shadow-md"
                                >
                                    {loading ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Search className="size-5" />
                                            <span className="hidden sm:inline">Buscar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sugerencias rápidas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Sugerencias populares</h3>
                    <span className="text-sm text-gray-500">Click para buscar</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSearchTerm(suggestion)
                                setTimeout(() => handleSearch(suggestion), 50)
                            }}
                            className="px-4 py-2.5 bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-medium border border-gray-200 hover:border-gray-300 flex items-center gap-2 group"
                        >
                            <span>{suggestion}</span>
                            <ChevronRight className="size-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 text-center animate-shake">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <X className="size-6 text-red-600" />
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Entendido
                    </button>
                </div>
            )}

            {/* Resultados */}
            {movies.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {movies.length} resultados encontrados
                            </h2>
                            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                Mostrando {filter === 'all' ? 'todos' : filter === 'movie'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
                        {movies.map((movie) => {
                            const isInFavorites = isMovieInFavorites(movie)

                            return (
                                <div
                                    key={movie.imdbID}
                                    className="group relative bg-linear-to-br from-white to-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-200"
                                >
                                    {/* Poster */}
                                    <div className="relative aspect-2/3 overflow-hidden bg-linear-to-br from-gray-200 to-gray-300">
                                        {/* Usar el componente MoviePoster en lugar de img directo */}
                                        <MoviePoster
                                            src={movie.Poster !== 'N/A' ? movie.Poster : ''}
                                            alt={movie.Title}
                                            title={movie.Title}
                                        />

                                        {/* Overlay con info solo en hover */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                {/* Aquí podrías agregar información adicional si la obtienes */}
                                            </div>
                                        </div>

                                        {/* Botón favoritos - corazón */}
                                        <button
                                            onClick={() => handleAddToFavorites(movie)}
                                            disabled={addingMovie === movie.imdbID || isInFavorites}
                                            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 shadow-lg ${isInFavorites
                                                ? 'bg-green-500 hover:bg-green-600 cursor-default'
                                                : 'bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            title={isInFavorites ? "Ya en favoritos" : "Agregar a favoritos"}
                                        >
                                            {addingMovie === movie.imdbID ? (
                                                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : isInFavorites ? (
                                                <div className="flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs">✓</span>
                                                </div>
                                            ) : (
                                                <Heart className="size-4 text-white" />
                                            )}
                                        </button>

                                        {/* Año en esquina superior izquierda */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded">
                                                {movie.Year}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Solo el título de la película */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 text-center">
                                            {movie.Title}
                                        </h3>
                                        <p className="text-xs text-gray-500 text-center mt-1">
                                            {movie.Year} • {movie.Type === 'movie' ? 'Película' : 'Serie'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Estado inicial */}
            {!loading && !error && movies.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl inline-block mb-6">
                            <Film className="size-16 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            Explora el universo del cine
                        </h3>
                        <p className="text-gray-600 mb-8">
                            Busca entre miles de películas. Agrega tus favoritos a tu colección personal.
                        </p>

                        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                            {suggestions.slice(0, 4).map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSearchTerm(suggestion)
                                        setTimeout(() => handleSearch(suggestion), 50)
                                    }}
                                    className="px-4 py-3 bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-medium border border-gray-200 hover:border-gray-300 text-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <div className="size-20 border-4 border-blue-200 rounded-full"></div>
                        <div className="size-20 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Buscando en nuestra base de datos...</p>
                    <p className="text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                </div>
            )}
        </div>
    )
}

export default Catalog