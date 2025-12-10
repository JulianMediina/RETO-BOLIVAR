import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * QUERIES - Obtener datos
 */

// Obtener todas las películas del usuario (alias de getMovies para compatibilidad)
export const getMovies = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }
    
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return movies;
  },
});

// Obtener todas las películas del usuario actual (misma funcionalidad que getMovies)
export const listMovies = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }
    
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return movies;
  },
});

// Obtener una película específica por ID
export const getMovie = query({
  args: {
    id: v.id("movies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.id);
    
    if (!movie) {
      throw new Error("Película no encontrada");
    }
    
    if (movie.userId !== args.userId) {
      throw new Error("No tienes permisos para ver esta película");
    }
    
    return movie;
  },
});

// Buscar películas por título en la base de datos local
export const searchMovies = query({
  args: {
    userId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim() || !args.userId) {
      return [];
    }
    
    try {
      // Usar índice de búsqueda si está configurado, de lo contrario filtrar manualmente
      const movies = await ctx.db
        .query("movies")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      
      const searchTerm = args.searchTerm.toLowerCase().trim();
      
      return movies.filter(movie => 
        movie.titulo.toLowerCase().includes(searchTerm) ||
        movie.director.toLowerCase().includes(searchTerm) ||
        movie.genero.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Error en searchMovies:", error);
      return [];
    }
  },
});

/**
 * MUTATIONS - Modificar datos
 */

// Crear una nueva película
export const createMovie = mutation({
  args: {
    userId: v.string(),
    titulo: v.string(),
    genero: v.string(),
    anio: v.number(),
    director: v.string(),
    poster: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validaciones mejoradas
    if (!args.userId?.trim()) {
      throw new Error("ID de usuario requerido");
    }
    
    const titulo = args.titulo.trim();
    const genero = args.genero.trim();
    const director = args.director.trim();
    
    if (!titulo) {
      throw new Error("El título es obligatorio");
    }
    
    if (titulo.length < 2) {
      throw new Error("El título debe tener al menos 2 caracteres");
    }
    
    if (!genero) {
      throw new Error("El género es obligatorio");
    }
    
    const currentYear = new Date().getFullYear();
    if (args.anio < 1800 || args.anio > currentYear + 5) {
      throw new Error(`Año inválido. Debe estar entre 1800 y ${currentYear + 5}`);
    }
    
    if (!director) {
      throw new Error("El director es obligatorio");
    }
    
    const now = Date.now();
    
    // Verificar si ya existe una película con el mismo título y año para este usuario
    const existingMovies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const duplicate = existingMovies.find(movie => 
      movie.titulo.toLowerCase() === titulo.toLowerCase() && 
      movie.anio === args.anio
    );
    
    if (duplicate) {
      throw new Error("Ya tienes una película con este título y año en tu catálogo");
    }
    
    const movieId = await ctx.db.insert("movies", {
      userId: args.userId,
      titulo: titulo,
      genero: genero,
      anio: args.anio,
      director: director,
      poster: args.poster || "",
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      success: true, 
      id: movieId,
      message: "Película creada exitosamente"
    };
  },
});

// Actualizar una película existente
export const updateMovie = mutation({
  args: {
    id: v.id("movies"),
    userId: v.string(),
    titulo: v.string(),
    genero: v.string(),
    anio: v.number(),
    director: v.string(),
    poster: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    
    if (!existing) {
      throw new Error("Película no encontrada");
    }
    
    if (existing.userId !== args.userId) {
      throw new Error("No tienes permisos para editar esta película");
    }
    
    // Validaciones
    const titulo = args.titulo.trim();
    const genero = args.genero.trim();
    const director = args.director.trim();
    
    if (!titulo) {
      throw new Error("El título es obligatorio");
    }
    
    if (titulo.length < 2) {
      throw new Error("El título debe tener al menos 2 caracteres");
    }
    
    if (!genero) {
      throw new Error("El género es obligatorio");
    }
    
    const currentYear = new Date().getFullYear();
    if (args.anio < 1800 || args.anio > currentYear + 5) {
      throw new Error(`Año inválido. Debe estar entre 1800 y ${currentYear + 5}`);
    }
    
    if (!director) {
      throw new Error("El director es obligatorio");
    }
    
    // Verificar si otro registro tiene el mismo título y año
    const existingMovies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const duplicate = existingMovies.find(movie => 
      movie._id !== args.id &&
      movie.titulo.toLowerCase() === titulo.toLowerCase() && 
      movie.anio === args.anio
    );
    
    if (duplicate) {
      throw new Error("Ya tienes una película con este título y año en tu catálogo");
    }
    
    await ctx.db.patch(args.id, {
      titulo: titulo,
      genero: genero,
      anio: args.anio,
      director: director,
      poster: args.poster || existing.poster,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true, 
      id: args.id,
      message: "Película actualizada exitosamente"
    };
  },
});

// Eliminar una película
export const deleteMovie = mutation({
  args: {
    id: v.id("movies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    
    if (!existing) {
      throw new Error("Película no encontrada");
    }
    
    if (existing.userId !== args.userId) {
      throw new Error("No tienes permisos para eliminar esta película");
    }
    
    await ctx.db.delete(args.id);
    
    return { 
      success: true, 
      message: "Película eliminada exitosamente" 
    };
  },
});

/**
 * QUERIES ADICIONALES - Para estadísticas y utilidades
 */

// Obtener estadísticas de películas del usuario
export const getMovieStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    if (movies.length === 0) {
      return {
        total: 0,
        byYear: {},
        byGenre: {},
        latest: null,
        oldest: null,
      };
    }
    
    // Agrupar por año
    const byYear: Record<number, number> = {};
    // Agrupar por género
    const byGenre: Record<string, number> = {};
    
    let latest = movies[0];
    let oldest = movies[0];
    
    movies.forEach(movie => {
      // Por año
      byYear[movie.anio] = (byYear[movie.anio] || 0) + 1;
      
      // Por género (separar múltiples géneros)
      const generos = movie.genero.split(',').map(g => g.trim());
      generos.forEach(genero => {
        if (genero) {
          byGenre[genero] = (byGenre[genero] || 0) + 1;
        }
      });
      
      // Encontrar más reciente y más antigua
      if (movie.anio > latest.anio) latest = movie;
      if (movie.anio < oldest.anio) oldest = movie;
    });
    
    return {
      total: movies.length,
      byYear,
      byGenre,
      latest: {
        titulo: latest.titulo,
        anio: latest.anio,
      },
      oldest: {
        titulo: oldest.titulo,
        anio: oldest.anio,
      },
    };
  },
});

// Obtener películas más recientes (para dashboard)
export const getRecentMovies = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }
    
    const limit = args.limit || 5;
    
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    
    return movies;
  },
});