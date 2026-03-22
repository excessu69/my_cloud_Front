export function formatDate(dateString) {
  if (!dateString) return "Ещё не скачивался";

  return new Date(dateString).toLocaleString("ru-RU");
}
