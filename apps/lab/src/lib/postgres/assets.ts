import type { PGliteOptions } from "@electric-sql/pglite";

const PGLITE_PACKAGE_VERSION = "0.5.1";
const PGLITE_CDN_BASE = `https://cdn.jsdelivr.net/npm/@electric-sql/pglite@${PGLITE_PACKAGE_VERSION}/dist`;
const PGLITE_MODULE_URL = `https://cdn.jsdelivr.net/npm/@electric-sql/pglite@${PGLITE_PACKAGE_VERSION}/+esm`;

const pgliteAssetUrls = {
  pgliteWasm: `${PGLITE_CDN_BASE}/pglite.wasm`,
  initdbWasm: `${PGLITE_CDN_BASE}/initdb.wasm`,
  fsBundle: `${PGLITE_CDN_BASE}/pglite.data`,
};

let pgliteAssetOptionsPromise: Promise<
  Pick<PGliteOptions, "pgliteWasmModule" | "initdbWasmModule" | "fsBundle">
> | null = null;
let pgliteModulePromise: Promise<typeof import("@electric-sql/pglite")> | null = null;

async function fetchAsset(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Impossibile scaricare l'asset PostgreSQL: ${url}`);
  }

  return response;
}

async function loadWasmModule(url: string) {
  const response = await fetchAsset(url);
  return WebAssembly.compile(await response.arrayBuffer());
}

async function loadFsBundle(url: string) {
  const response = await fetchAsset(url);
  return response.blob();
}

export function getPGliteAssetOptions() {
  pgliteAssetOptionsPromise ??= Promise.all([
    loadWasmModule(pgliteAssetUrls.pgliteWasm),
    loadWasmModule(pgliteAssetUrls.initdbWasm),
    loadFsBundle(pgliteAssetUrls.fsBundle),
  ]).then(([pgliteWasmModule, initdbWasmModule, fsBundle]) => ({
    pgliteWasmModule,
    initdbWasmModule,
    fsBundle,
  }));

  return pgliteAssetOptionsPromise;
}

export async function getPGliteConstructor() {
  pgliteModulePromise ??= import(/* @vite-ignore */ PGLITE_MODULE_URL) as Promise<
    typeof import("@electric-sql/pglite")
  >;

  const { PGlite } = await pgliteModulePromise;
  return PGlite;
}
