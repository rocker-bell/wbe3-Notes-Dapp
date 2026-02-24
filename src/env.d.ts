/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPERATOR_ID: string;
  readonly VITE_OPERATOR_KEY: string;
  readonly VITE_NETWORK: "testnet" | "mainnet";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}