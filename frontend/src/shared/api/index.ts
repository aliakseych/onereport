import { ApiClient } from "@/shared/api/api-client";
import { createHttpApi } from "@/shared/api/http-api";
import { createMockApi } from "@/shared/api/mock-api";
import type { SolveItApi } from "@/shared/api/contracts";
import { env } from "@/shared/config/env";

const apiClient = new ApiClient(env.apiBaseUrl);

export const api: SolveItApi =
  env.apiMode === "real" ? createHttpApi(apiClient) : createMockApi();
