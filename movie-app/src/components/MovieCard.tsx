import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Calendar, User, Film } from 'lucide-react';
import { Id } from "../../convex/_generated/dataModel";

interface Movie {
  _id: Id<"movies">;
  titulo: string;
  genero: string;
  anio: number;
  director: string;
  poster?: string;
}

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: Id<"movies">) => Promise<void>;
}

/**
 * Tarjeta de película individual
 * Muestra la información de una película con opciones de editar/eliminar
 */
const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`¿Seguro que deseas eliminar "${movie.titulo}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(movie._id);
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la película');
            setIsDeleting(false);
        }
    };

    const defaultPoster =
        'https://via.placeholder.com/300x450/0ea5e9/ffffff?text=Sin+Poster';

    const posterUrl =
        movie.poster && !imageError ? movie.poster : defaultPoster;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fade-in">
            {/* Poster */}
            <div className="relative overflow-hidden bg-gray-200 aspect-[2/3]">
                <img
                    src={posterUrl}
                    alt={`Poster de ${movie.titulo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />

                {/* Overlay con botones al hacer hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <Link
                        to={`/edit/${movie._id}`}
                        className="p-3 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors transform hover:scale-110"
                        title="Editar película"
                    >
                        <Edit className="w-5 h-5 text-white" />
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar película"
                    >
                        <Trash2 className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Información */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {movie.titulo}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <Film className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="line-clamp-1">{movie.genero}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span>{movie.anio}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="line-clamp-1">{movie.director}</span>
                    </div>
                </div>

                {/* Botones mobile */}
                <div className="flex space-x-2 mt-4 sm:hidden">
                    <Link
                        to={`/edit/${movie._id}`}
                        className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-center text-sm font-medium"
                    >
                        Editar
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
