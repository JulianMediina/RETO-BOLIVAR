import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * QUERIES - Obtener datos
 */

// Obtener todas las películas del usuario actual
export const listMovies = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
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
    
    // Verificar que la película pertenece al usuario
    if (!movie || movie.userId !== args.userId) {
      throw new Error("Película no encontrada o sin permisos");
    }
    
    return movie;
  },
});

// Buscar películas por título
export const searchMovies = query({
  args: {
    userId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return [];
    }
    
    const movies = await ctx.db
      .query("movies")
      .withSearchIndex("search_titulo", (q) =>
        q.search("titulo", args.searchTerm).eq("userId", args.userId)
      )
      .collect();
    
    return movies;
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
    // Validaciones
    if (!args.titulo.trim()) {
      throw new Error("El título es obligatorio");
    }
    if (args.anio < 1800 || args.anio > new Date().getFullYear() + 5) {
      throw new Error("Año inválido");
    }
    if (!args.director.trim()) {
      throw new Error("El director es obligatorio");
    }
    
    const now = Date.now();
    
    const movieId = await ctx.db.insert("movies", {
      userId: args.userId,
      titulo: args.titulo.trim(),
      genero: args.genero.trim(),
      anio: args.anio,
      director: args.director.trim(),
      poster: args.poster,
      createdAt: now,
      updatedAt: now,
    });
    
    return movieId;
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
    
    // Verificar permisos
    if (!existing || existing.userId !== args.userId) {
      throw new Error("Película no encontrada o sin permisos");
    }
    
    // Validaciones
    if (!args.titulo.trim()) {
      throw new Error("El título es obligatorio");
    }
    if (args.anio < 1800 || args.anio > new Date().getFullYear() + 5) {
      throw new Error("Año inválido");
    }
    if (!args.director.trim()) {
      throw new Error("El director es obligatorio");
    }
    
    await ctx.db.patch(args.id, {
      titulo: args.titulo.trim(),
      genero: args.genero.trim(),
      anio: args.anio,
      director: args.director.trim(),
      poster: args.poster,
      updatedAt: Date.now(),
    });
    
    return args.id;
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
    
    // Verificar permisos
    if (!existing || existing.userId !== args.userId) {
      throw new Error("Película no encontrada o sin permisos");
    }
    
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});