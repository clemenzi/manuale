import { loadPHPRuntime, type EmscriptenOptions, type PHPLoaderModule } from "@php-wasm/universal";

export const LAB_PHP_VERSION = "8.5";

const PHP_WASM_PACKAGE_VERSION = "3.1.35";
const PHP_WASM_CDN_BASE = `https://cdn.jsdelivr.net/npm/@php-wasm/web-${LAB_PHP_VERSION.replace(".", "-")}@${PHP_WASM_PACKAGE_VERSION}`;

type PHPWasmAsyncMode = "jspi" | "asyncify";
type GlobalWithSetImmediate = {
  setImmediate?: (callback: () => void) => ReturnType<typeof setTimeout>;
};

type PHPRuntimeAsset = {
  mode: PHPWasmAsyncMode;
  runtimeUrl: string;
  wasmUrl: string;
};

const phpRuntimeAssets: Record<PHPWasmAsyncMode, PHPRuntimeAsset> = {
  jspi: {
    mode: "jspi",
    runtimeUrl: `${PHP_WASM_CDN_BASE}/jspi/php_8_5.js`,
    wasmUrl: `${PHP_WASM_CDN_BASE}/jspi/8_5_6/php_8_5.wasm`,
  },
  asyncify: {
    mode: "asyncify",
    runtimeUrl: `${PHP_WASM_CDN_BASE}/asyncify/php_8_5.js`,
    wasmUrl: `${PHP_WASM_CDN_BASE}/asyncify/8_5_6/php_8_5.wasm`,
  },
};

let loaderModulePromise: Promise<{
  loaderModule: PHPLoaderModule;
  mode: PHPWasmAsyncMode;
}> | null = null;

async function supportsJSPI() {
  return "Suspending" in WebAssembly;
}

async function fetchRuntimeSource(asset: PHPRuntimeAsset) {
  const response = await fetch(asset.runtimeUrl);

  if (!response.ok) {
    throw new Error(`Impossibile scaricare il runtime PHP ${LAB_PHP_VERSION}.`);
  }

  const source = await response.text();

  return source.replace(
    /^import dependencyFilename from ['"].+php_8_5\.wasm['"];$/m,
    `const dependencyFilename = ${JSON.stringify(asset.wasmUrl)};`,
  );
}

async function importRuntimeModule(asset: PHPRuntimeAsset) {
  const source = await fetchRuntimeSource(asset);
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

  try {
    return (await import(/* @vite-ignore */ moduleUrl)) as PHPLoaderModule;
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

function getLoaderModule() {
  loaderModulePromise ??= supportsJSPI().then(async (hasJSPI) => {
    const asset = hasJSPI ? phpRuntimeAssets.jspi : phpRuntimeAssets.asyncify;
    const loaderModule = await importRuntimeModule(asset);

    return {
      loaderModule,
      mode: asset.mode,
    };
  });

  return loaderModulePromise;
}

export async function loadLabPHPRuntime(options?: EmscriptenOptions) {
  const runtimeGlobal = globalThis as unknown as GlobalWithSetImmediate;
  runtimeGlobal.setImmediate ??= (callback: () => void) => setTimeout(callback, 0);

  const { loaderModule, mode } = await getLoaderModule();

  return loadPHPRuntime(loaderModule, {
    ...options,
    phpWasmAsyncMode: mode,
  });
}
