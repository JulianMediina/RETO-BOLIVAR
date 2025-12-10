import axios from 'axios';
import type { OMDbResponse, PosterData } from '../types';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Servicio para interactuar con la API de OMDb
 */

/**
 * Buscar película por título y obtener su poster
 * @param {string} title - Título de la película
 * @returns {Promise<PosterData>}
 */
export const fetchPosterByTitle = async (title: string): Promise<PosterData> => {
  try {
    if (!title || !title.trim()) {
      throw new Error('El título es requerido');
    }

    if (!OMDB_API_KEY) {
      throw new Error('API Key de OMDb no configurada');
    }

    const response = await axios.get<OMDbResponse>(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        t: title.trim(),
        type: 'movie',
      },
      timeout: 10000, // 10 segundos de timeout
    });

    // Verificar si se encontró la película
    if (response.data.Response === 'False') {
      return {
        found: false,
        poster: null,
        error: response.data.Error || 'Película no encontrada',
      };
    }

    // Extraer información relevante
    const poster = response.data.Poster !== 'N/A' ? response.data.Poster : null;

    return {
      found: true,
      poster,
      title: response.data.Title,
      year: response.data.Year,
      director: response.data.Director,
      genre: response.data.Genre,
      plot: response.data.Plot,
    };
  } catch (error) {
    console.error('Error fetching poster from OMDb:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout al conectar con OMDb');
      }
      
      if (error.response) {
        throw new Error(`Error de OMDb: ${error.response.status}`);
      }
    }
    
    throw new Error(error instanceof Error ? error.message : 'Error al buscar la película');
  }
};

/**
 * Resultado de búsqueda de OMDb
 */
export interface OMDbSearchResult {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

/**
 * Buscar películas por término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<OMDbSearchResult[]>}
 */
export const searchMovies = async (searchTerm: string): Promise<OMDbSearchResult[]> => {
  try {
    if (!searchTerm || !searchTerm.trim()) {
      return []
    }

    if (!OMDB_API_KEY) {
      throw new Error('API Key de OMDb no configurada')
    }

    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: searchTerm.trim(),
        type: 'movie',
      },
      timeout: 10000,
    })

    if (response.data.Response === 'False') {
      return []
    }

    return response.data.Search || []
  } catch (error) {
    console.error('Error searching movies from OMDb:', error)
    throw error
  }
}

/**
 * Validar si una URL de poster es válida
 * @param {string} url - URL del poster
 * @returns {boolean}
 */
export const isValidPosterUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};