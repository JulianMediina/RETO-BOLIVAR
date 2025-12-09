import { useState } from "react";
import { fetchPosterByTitle } from "../services/omdb";

// ----- Tipos -----

export interface PosterResult {
  found: boolean;
  poster?: string;
  title?: string;
  year?: string;
  genre?: string;
  director?: string;
  error?: string;
}

/**
 * Estado completo del hook usePoster
 */
interface UsePosterState {
  loading: boolean;
  error: string | null;
  posterData: PosterResult | null;
  searchPoster: (title: string) => Promise<PosterResult | null>;
  reset: () => void;
}

// ----- Hook -----

/**
 * Hook personalizado para buscar posters de películas en OMDb
 */
export const usePoster = (): UsePosterState => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [posterData, setPosterData] = useState<PosterResult | null>(null);

  /**
   * Buscar poster por título de película
   */
  const searchPoster = async (title: string): Promise<PosterResult | null> => {
    setError(null);
    setPosterData(null);

    if (!title.trim()) {
      setError("Por favor ingresa un título");
      return null;
    }

    setLoading(true);

    try {
      const result = await fetchPosterByTitle(title);

      if (result.found) {
        setPosterData(result);
        return result;
      } else {
        setError(result.error || "No se encontró la película en OMDb");
        return null;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al buscar el poster";

      setError(message);
      console.error("Error in usePoster:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar el estado del hook
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setPosterData(null);
  };

  return {
    loading,
    error,
    posterData,
    searchPoster,
    reset,
  };
};

export default usePoster;
