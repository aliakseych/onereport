import { cx } from "@/shared/lib/cx";

interface MaterialIconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

export function MaterialIcon({
  name,
  className,
  fill = false,
}: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("material-symbols-outlined", className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}
