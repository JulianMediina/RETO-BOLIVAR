import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Schema de la base de datos Convex
 * Define la estructura de las tablas y sus campos
 */
export default defineSchema({
  movies: defineTable({
    // ID del usuario propietario (desde Clerk)
    userId: v.string(),
    
    // Información de la película
    titulo: v.string(),
    genero: v.string(),
    anio: v.number(),
    director: v.string(),
    
    // URL del poster desde OMDb
    poster: v.optional(v.string()),
    
    // Metadatos
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Índices para optimizar las consultas
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"])
    .searchIndex("search_titulo", {
      searchField: "titulo",
      filterFields: ["userId"]
    }),
});