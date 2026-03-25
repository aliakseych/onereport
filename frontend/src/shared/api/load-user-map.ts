import type { User } from "@/entities/user/model/types";
import { api } from "@/shared/api";

export async function loadUserMapByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  const profiles = await Promise.all(
    uniqueIds.map((id) => api.getUserProfile(id)),
  );

  return profiles.reduce<Record<string, User>>((accumulator, profile) => {
    if (profile?.user) {
      accumulator[profile.user.id] = profile.user;
    }

    return accumulator;
  }, {});
}
