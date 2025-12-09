import { Id } from "../../convex/_generated/dataModel";

/**
 * Tipos e interfaces de la aplicación
 */

// Película del catálogo
export interface Movie {
  _id: Id<"movies">;
  _creationTime: number;
  userId: string;
  titulo: string;
  genero: string;
  anio: number;
  director: string;
  poster?: string;
  createdAt: number;
  updatedAt: number;
}

// Datos del formulario de película
export interface MovieFormData {
  titulo: string;
  genero: string;
  anio: number;
  director: string;
  poster?: string;
}

// Respuesta de la API de OMDb
export interface OMDbResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

// Datos del poster procesados
export interface PosterData {
  found: boolean;
  poster: string | null;
  title?: string;
  year?: string;
  director?: string;
  genre?: string;
  plot?: string;
  error?: string;
}

// Hook de poster
export interface UsePosterReturn {
  loading: boolean;
  error: string | null;
  posterData: PosterData | null;
  searchPoster: (title: string) => Promise<PosterData | null>;
  reset: () => void;
}

// Props de componentes
export interface MovieCardProps {
  movie: Movie;
  onDelete: (id: Id<"movies">) => Promise<void>;
}

export interface MovieFormProps {
  initialData?: Movie | null;
  onSubmit: (data: MovieFormData) => Promise<void>;
  isLoading?: boolean;
}