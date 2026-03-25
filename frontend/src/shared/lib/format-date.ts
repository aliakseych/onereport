const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDisplayDate(value: string) {
  return dateFormatter.format(new Date(value));
}
