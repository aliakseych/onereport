const relativeTimeFormatter = new Intl.RelativeTimeFormat("ru-RU", {
  numeric: "auto",
});

function formatRelative(value: number, unit: Intl.RelativeTimeFormatUnit) {
  return relativeTimeFormatter.format(value, unit);
}

export function formatRelativeTime(value: string) {
  const targetTime = new Date(value).getTime();
  const currentTime = Date.now();
  const diffMs = targetTime - currentTime;

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  if (Math.abs(diffMs) < minuteMs) {
    return "только что";
  }

  if (Math.abs(diffMs) < hourMs) {
    return formatRelative(Math.round(diffMs / minuteMs), "minute");
  }

  if (Math.abs(diffMs) < dayMs) {
    return formatRelative(Math.round(diffMs / hourMs), "hour");
  }

  if (Math.abs(diffMs) < weekMs) {
    return formatRelative(Math.round(diffMs / dayMs), "day");
  }

  if (Math.abs(diffMs) < monthMs) {
    return formatRelative(Math.round(diffMs / weekMs), "week");
  }

  if (Math.abs(diffMs) < yearMs) {
    return formatRelative(Math.round(diffMs / monthMs), "month");
  }

  return formatRelative(Math.round(diffMs / yearMs), "year");
}

export function isWithinDays(value: string, days: number) {
  const targetTime = new Date(value).getTime();
  const diffMs = Math.abs(Date.now() - targetTime);

  return diffMs <= days * 24 * 60 * 60 * 1000;
}
