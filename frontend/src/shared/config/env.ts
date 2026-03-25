type ApiMode = "mock" | "real";

function getApiMode(): ApiMode {
  return import.meta.env.VITE_API_MODE === "real" ? "real" : "mock";
}

export const env = {
  apiMode: getApiMode(),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  publicBasePath: import.meta.env.VITE_PUBLIC_BASE_PATH || "/",
  routerBasename: import.meta.env.VITE_ROUTER_BASENAME || "",
};
