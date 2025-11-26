/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_IPFS_PROJECT_ID: string;
    readonly VITE_IPFS_PROJECT_SECRET: string;
    readonly VITE_IPFS_GATEWAY: string;
    readonly VITE_PINATA_API_KEY: string;
    readonly VITE_PINATA_SECRET_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
