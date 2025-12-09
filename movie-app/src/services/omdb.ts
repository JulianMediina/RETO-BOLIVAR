import axios, { AxiosError } from "axios";
import type { PosterResult } from "../hooks/usePoster";

const OMDB_API_KEY: string | undefined = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com/";

// ---------------------------------------
// Tipos específicos de OMDb
// ---------------------------------------

export interface OmdbMovieResponse {
  Response: "True" | "False";
  Error?: string;
  Title?: string;
  Year?: string;
  Director?: string;
  Genre?: string;
  Plot?: string;
  Poster?: string;
}

export interface OmdbSearchResult {
  Search: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Poster: string;
  }>;
  totalResults: string;
  Response: "True" | "False";
}

// ---------------------------------------
// Servicio: Buscar película por título
// ---------------------------------------

export const fetchPosterByTitle = async (
  title: string
): Promise<PosterResult> => {
  if (!title.trim()) {
    throw new Error("El título es requerido");
  }

  if (!OMDB_API_KEY) {
    throw new Error("API Key de OMDb no configurada");
  }

  try {
    const response = await axios.get<OmdbMovieResponse>(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        t: title.trim(),
        type: "movie",
      },
      timeout: 10000,
    });

    const data = response.data;

    if (data.Response === "False") {
      return {
        found: false,
        poster: undefined,
        error: data.Error ?? "Película no encontrada",
      };
    }

    return {
      found: true,
      poster: data.Poster !== "N/A" ? data.Poster : undefined,
      title: data.Title,
      year: data.Year,
      director: data.Director,
      genre: data.Genre,
    };
  } catch (error) {
    const err = error as AxiosError;

    console.error("Error fetching poster from OMDb:", err);

    if (err.code === "ECONNABORTED") {
      throw new Error("Timeout al conectar con OMDb");
    }

    if (err.response) {
      throw new Error(`Error de OMDb: ${err.response.status}`);
    }

    throw new Error(err.message || "Error al buscar la película");
  }
};

// ---------------------------------------
// Servicio: Buscar múltiples películas
// ---------------------------------------

export const searchMovies = async (
  searchTerm: string
): Promise<OmdbSearchResult["Search"]> => {
  if (!searchTerm.trim()) return [];

  if (!OMDB_API_KEY) {
      throw new Error("API Key de OMDb no configurada");
  }

  try {
    const response = await axios.get<OmdbSearchResult>(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: searchTerm.trim(),
        type: "movie",
      },
      timeout: 10000,
    });

    if (response.data.Response === "False") {
      return [];
    }

    return response.data.Search ?? [];
  } catch (error) {
    console.error("Error searching movies from OMDb:", error);
    throw error;
  }
};

// ---------------------------------------
// Utilidad: Validar URL de poster
// ---------------------------------------

export const isValidPosterUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
