import { defineStore } from "pinia";
import { ref, computed } from "vue";
// import { debounce } from "lodash-es";
import CINEMA_API from "../api/cinemaguideAPI";
import type { IMovies } from "../types/movies.ts";

export const useMoviesStore = defineStore("movies", () => {
  // state
  const movies = ref<IMovies[]>([]);
  const movieRandom = ref<IMovies | null>(null);
  const movieByTitle = ref<IMovies[] | null>(null);
  const movieById = ref<IMovies | null>(null);
  const moviesTop = ref<IMovies[] | null>(null);
  const genres = ref<string[] | null>(null);
  // переменная для хранения текста поиска
  const searchTitle = ref<string>("");
  // отдельные флаги для загрузки поиска и основного контента
  const isLoading = ref<boolean>(false);
  const isSearchLoading = ref<boolean>(false);
  // переменная для хранения ошибок
  const error = ref<string | null>(null);

  // Информирует пользователя об ошибке
  // --- HELPERS ---
  const setError = (err: any) => {
    const message = err.response?.data?.message || err.message || "Ошибка API";
    error.value = message;
    console.error(message);
  };

  // Получаем ВСЕ фильмы или с опциональными параметрами (например { genre, title })
  const getMovies = async (params?: Record<string, any>): Promise<void> => {
    isLoading.value = true;
    error.value = null; // Сбрасываем ошибку перед запросом
    try {
      const { data } = await CINEMA_API.get<IMovies[]>("/movie", { params });
      movies.value = data;
      console.log("Получаем фильмы по параметам ", params, movies.value);
    } catch (error) {
      setError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем TOP 10 фильмов
  const getTopMovies = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const { data } = await CINEMA_API.get<IMovies[]>("/movie/top10");
      moviesTop.value = data;
      console.log(moviesTop.value);
    } catch (error) {
      setError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем случайный фильм
  const getMoviesByRandom = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const { data } = await CINEMA_API.get<IMovies>("/movie/random");
      movieRandom.value = data;
      console.log(movieRandom.value);
    } catch (error) {
      setError(error);
      console.error("Ошибка получения случайного фильма: ", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем список жанров фильмов
  const getMoviesByGenres = async () => {
    isLoading.value = true;
    try {
      const { data } = await CINEMA_API.get<string[]>("/movie/genres");
      genres.value = data;
      console.log(genres.value);
    } catch (error) {
      setError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // Получаем фильм по ID
  const getMovieById = async (id: number | string): Promise<void> => {
    isLoading.value = true;
    try {
      const { data } = await CINEMA_API.get<IMovies>(`/movie/${id}`);
      movieById.value = data;
    } catch (err) {
      setError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Вызывается при вводе текста в поле поиска и сохраняет его в searchText
  const searchQuery = (query: string) => {
    searchTitle.value = query;
    // console.log(searchTitle.value);
  };

  const clearSearch = () => {
    movieByTitle.value = [];
    searchTitle.value = "";
  };

  // Получаем фильмы по названию (API поиск)
  const fetchMovieByTitle = async (query: string) => {
    if (!query) return;
    isSearchLoading.value = true;
    try {
      const { data } = await CINEMA_API.get<IMovies[]>(`/movie`, {
        params: { title: query },
      });
      // Ограничение вывода фильмов до 5 элементов
      movieByTitle.value = data.slice(0, 5);
    } catch (err) {
      setError(err);
    } finally {
      isSearchLoading.value = false;
    }
  };

  // Обёртка для получения фильмов по жанру (сохраняет backward compatibility)
  const getMoviesByGenre = async (genre: string) => {
    return await getMovies({ genre });
  };

  // getters
  // проверка наличия полученных фильмов
  const hasMovies = computed(() => movies.value?.length);

  // Возвращает отфильтрованные фильмы по названию title
  const filteredMovies = computed(() => {
    const query = searchTitle.value.trim().toLowerCase();
    if (query.length < 2) return movies.value;

    return movies.value.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );
  });

  // Возвращает все необходимые данные и методы
  return {
    movies,
    genres,
    moviesTop,
    movieRandom,
    movieById,
    movieByTitle,
    isLoading,
    isSearchLoading,
    searchTitle,
    error,
    hasMovies,
    filteredMovies,
    setError,
    getMovies,
    getTopMovies,
    getMoviesByRandom,
    getMoviesByGenres,
    getMoviesByGenre,
    getMovieById,
    fetchMovieByTitle,
    clearSearch,
    searchQuery,
  };
});
