export interface User {
  id: string;
  username: string;
  email?: string;
  followersCount: number;
  followingCount: number;
  displayName?: string;
  bio?: string;
  memberSince?: string;
  avatarLabel?: string;
}
