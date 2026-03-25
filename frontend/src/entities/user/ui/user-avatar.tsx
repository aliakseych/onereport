import type { User } from "@/entities/user/model/types";
import { cx } from "@/shared/lib/cx";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-24 w-24 text-xl",
};

function getFallbackInitials(user: User) {
  if (user.avatarLabel) {
    return user.avatarLabel;
  }

  const source = user.displayName || user.username;
  return source
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function UserAvatar({
  user,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-surface-container-highest to-secondary-container font-black tracking-[0.12em] text-primary",
        sizeClasses[size],
        className,
      )}
    >
      {getFallbackInitials(user)}
    </div>
  );
}
