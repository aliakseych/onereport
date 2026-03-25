import { useOutletContext } from "react-router-dom";

import type { User } from "@/entities/user/model/types";

export interface AppOutletContext {
  currentUser: User | null;
}

export function useAppOutletContext() {
  return useOutletContext<AppOutletContext>();
}
