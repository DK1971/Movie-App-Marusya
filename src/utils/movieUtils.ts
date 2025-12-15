// Изменение цвета рейтинга фильма в зависимости от значения
export const getRatingColor = (rating?: number | null) => {
  const r = Number(rating);
  if (!Number.isFinite(r)) return "red-label";
  if (r >= 7.6) return "gold-label";
  if (r >= 6.4) return "green-label";
  if (r >= 4.3) return "gray-label";
  return "red-label";
};

// Форматирование рейтинга до цифры с одной десятичной
export const formatRating = (rating?: number | null) => {
  const r = Number(rating);
  if (r == 0 || !Number.isFinite(r)) return "—";
  return r.toFixed(1);
};

// Форматирование длительности фильма (времени) в часы и минуты
export const getTimeFormat = (duration: number | undefined) => {
  if (duration === undefined) return "";
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours} ч. ${minutes} м.`;
};

// Автоматический скролл к шапке
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Словарь переводов жанров фильмов
export const genreTranslations: Record<string, string> = {
  action: "Боевик",
  adventure: "Приключение",
  animation: "Мультфильм",
  comedy: "Комедия",
  crime: "Детектив",
  documentary: "Документальный",
  drama: "Драма",
  family: "Семейный",
  fantasy: "Фантастика",
  history: "Исторический",
  horror: "Ужасы",
  music: "Музыкальный",
  mystery: "Мистика",
  romance: "Романтика",
  scifi: "Научно-фантастический",
  "stand-up": "Стендап",
  thriller: "Триллер",
  "tv-movie": "Телефильм",
  war: "Военный",
  western: "Вестерн",
};

// Преобразует любую ссылку YouTube в URL для iframe (embed)
export const convertYoutubeUrl = (url: string): string => {
  if (!url) return "";
  // Если уже embed URL, вернуть как есть
  if (url.includes("youtube.com/embed/")) return url;
  // Преобразование различных форматов YouTube URL
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  // Если не удалось распознать, вернуть оригинальный URL
  return url;
};
