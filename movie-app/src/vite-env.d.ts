/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CONVEX_URL: string;
  readonly VITE_OMDB_API_KEY: string;
  readonly CLERK_JWT_ISSUER_DOMAIN: String;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}